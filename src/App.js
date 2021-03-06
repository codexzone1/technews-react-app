import React, { Component} from 'react';
import fetch from "isomorphic-fetch";
import { sortBy } from 'lodash';
import className from 'classnames';
import './App.css';
import { render } from 'enzyme';

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  };

const Loading = () =>
<div>Loading ...</div>
 
 const updateSearchTopstoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey]
  ? results[searchKey].hits
  : [];
  const updatedHits = [
  ...oldHits,
  ...hits
  ];
  return {
  results: {
  ...results,
  [searchKey]: { hits: updatedHits, page }
  },
  isLoading: false
  };
  };

 class App extends Component {

  constructor(props) {
      super(props);

      this.state = {
        results: null,
        searchKey: '',
        searchTerm: DEFAULT_QUERY,  
        isLoading:false, 
        };
      this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
      this.setSearchTopstories = this.setSearchTopstories.bind(this);
      this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
      this.onSearchChange=this.onSearchChange.bind(this);
      this.onSearchSubmit = this.onSearchSubmit.bind(this);
      this.onDismiss = this.onDismiss.bind(this);
        }
     
    needsToSearchTopstories(searchTerm) {
        return !this.state.results[searchTerm];
        }

        setSearchTopstories(result) {
          const { hits, page } = result;
          this.setState(updateSearchTopstoriesState(hits, page));
          }

          fetchSearchTopstories(searchTerm, page) {
            this.setState({ isLoading: true });

            fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
            .then(response => response.json())
            .then(result => this.setSearchTopstories(result));
            }

            componentDidMount() {
              const { searchTerm } = this.state;
              this.setState({ searchKey: searchTerm });
              this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
              }

            onSearchSubmit(event){
            const { searchTerm } = this.state;
            this.setState({ searchKey: searchTerm });
             
            if (this.needsToSearchTopstories(searchTerm)) {
             this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
            }
            
            event.preventDefault();
            }

            onSearchChange(event){
              this.setState({searchTerm:event.target.value});
             }
          
             onDismiss(id) {
            const { searchKey, results } = this.state;
            const { hits, page } = results[searchKey];
            
            const isNotId = item => item.objectID !== id;      
            const updatedHits = hits.filter(isNotId);

             this.setState({
                results: { 
                  ...results,
                  [searchKey]:{ hits: updatedHits, page }
                }
              });
               }
      
        render() {
        const {
         searchTerm,
         results,
         searchKey,
         isLoading
         } = this.state;
        
        const page = (
          results &&
          results[searchKey] &&
          results[searchKey].page
        ) || 0;
        
        const list = (
          results &&
          results[searchKey] &&
          results[searchKey].hits
        ) || [];    
      
    return (
    <div className="page">
      <div className="interaction">
      <Search
      value={searchTerm}
      onChange={this.onSearchChange}
      onSubmit={this.onSearchSubmit}
      > Search
      </Search>
</div>
     
  <Table
       list={list}
       onDismiss={this.onDismiss}/>
    

     <div className="interactions">
     { isLoading
     ? <Loading/>
     : <Button 
     onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
     More
     </Button>
        }
    </div>
  </div>
    );
}}
  
  
const Search = ({
  value,
  onChange,
  onSubmit,
  children
}) =>
    <form onSubmit={onSubmit}>
     <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">
    {children}
    </button>
  </form>
  

class Table extends Component{
 
    constructor(props){
     super(props);
 
      this.state = {
        sortKey:'NONE',
        isSortReverse: false,
      };
  this.onSort=this.onSort.bind(this);
    }
    onSort(sortKey) {
      const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
      this.setState({ sortKey, isSortReverse });
      }
      render(){
       const{
        list,
        onDismiss
} = this.props;
        const{
          sortKey,
          isSortReverse,
          }=this.state;
const sortedList = SORTS[sortKey](list);
const reverseSortedList = isSortReverse
  ? sortedList.reverse()
  : sortedList;
   
  return(
    <div className="table">
      < div className='table-header'>
      <span style={{ width: '40%' }}>
<Sort
sortKey={'TITLE'}
onSort={this.onSort}
activeSortkey={sortKey}
>
Title
</Sort>
</span>
<span style={{ width: '30%' }}>
<Sort
sortKey={'AUTHOR'}
onSort={this.onSort}
activeSortkey={sortKey}
>
Author
</Sort>
</span>
<span style={{ width: '10%' }}>
<Sort
sortKey={'COMMENTS'}
onSort={this.onSort}
activeSortkey={sortKey}
>
Comments
</Sort>
</span>
<span style={{ width: '10%' }}>
<Sort
sortKey={'POINTS'}
onSort={this.onSort}
activeSortkey={sortKey}
>
Points
</Sort>
</span>
<span style={{ width: '10%' }}>
Archive
</span>
</div>
     { reverseSortedList.map((item) =>
      <div key={item.objectID} className="table-row">
       <span style={{width:'40%'}}>
        <a href={item.url}>{item.title}</a>
      </span>
     <span style={{width:'30%'}}>
       {item.author}
       </span>
     <span style={{width:'10%'}}>
       {item.num_comments}
       </span>
     <span style={{width:'10%'}}>
       {item.points}
       </span>
     <span style={{ width:'10%'}}>
     <Button
      onClick={() => onDismiss(item.objectID)}
       
      className="button-inline" 
      >
Dismiss
</Button>
</span>
</div>
)}
</div>
  );
     }
    }

 const Button= ({ onClick, className, children })=> 
    <button
     onClick={onClick}
     className={className}
     type="button"
    >
    {children}
    </button>
    Button.defaultProps = {
      className: '',
      };
const Sort = ({ 
  sortKey,
  activeSortkey, 
  onSort,
  children 
  }) =>{
   const sortClass = className(
     'button-inline',
    { 'button-active': sortKey === activeSortkey}
   );
   return(
  <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
      >
      {children}
      </Button>      
   );
   }
 export default App;
    export {
      Button,
      Search,
      Table,
      };