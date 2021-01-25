import React, { Component } from 'react'
import items from "./data";
import Client from "./Contentful";
//we get all the entries from all the space models in contentful
//Client.getEntries().then(response=> console.log(response.items))
//we get only from the content we need:
//Client.getEntries({content_type: "beachResortProject"}).then(response=> console.log(response.items))
const RoomContext = React.createContext();

 class RoomProvider extends Component {
    state={
        rooms:[],
        sortedRooms:[],
        featuredRooms:[],
        loading:true,
        type:'all',
        capacity:1,
        price:0,
        minPrice:0,
        maxPrice:0,
        minSize:0,
        maxSize:0,
        breakfast:false,
        pets:false
        
    }

    //getData
    getData = async() => {
        try {
            let response = await Client.getEntries({content_type: "beachResortProject",
        order:"fields.price"});
             let rooms = this.formatData(response.items);
            
       let featuredRooms = rooms.filter(room => room.featured === true);
       //get max value from the data fro price and sqft
       let maxPrice = Math.max(...rooms.map((item) => item.price));
        let minPrice = Math.min(...rooms.map((item) => item.price));
       let maxSize = Math.max(...rooms.map((item) => item.size));
       this.setState({
           rooms,
           featuredRooms,
           sortedRooms:rooms,
           loading: false,
           price: maxPrice,
           minPrice,
           maxPrice,
           maxSize



       })
        }
        catch(err){
            console.log(err)
        }
    }

    componentDidMount(){
       this.getData();
    }
    getRoom = (slug) => {
        let tempRooms = [...this.state.rooms];
        const room = tempRooms.find(room => room.slug === slug)
        return room;
    }

    handleChange = event => {
        const target = event.target;
        const value = target.type === 'checkbox'?target.checked:target.value
        const name = event.target.name;
        this.setState({
            [name]:value
        }, this.filterRooms)
        

    }
    filterRooms = () => {
      let {
          rooms, type, capacity, price, minSize, maxSize, breakfast, pets
      } = this.state;
      //all the rooms
      let tempRooms = [...rooms];
      //transform values
      capacity = parseInt(capacity);
      price = parseInt(price);
      //filter by type
      if(type !== 'all'){
          tempRooms = tempRooms.filter(item => item.type === type) 
      }
      //filter by capacity
      if(capacity !==1){
          tempRooms = tempRooms.filter(room => room.capacity >= capacity)
      }
      //filter by price 
      tempRooms = tempRooms.filter(room => room.price <= price) 
      //filter by size
      tempRooms = tempRooms.filter(room => room.size >= minSize && room.size <= maxSize)
    //breakfast filter
    if(breakfast){
        tempRooms = tempRooms.filter(room => room.breakfast === true)
    }
    //pets filter
    if(pets){
    tempRooms = tempRooms.filter(room => room.pets === true)
    }
      //change state
      this.setState({
          sortedRooms:tempRooms
      })
    }
    //formatter - getting a regular object
    

    formatData(items){
    let tempItems = items.map((item) => {
        let id = item.sys.id;
        let images = item.fields.images.map((img)=>{
            return img.fields.file.url
        });
        let room = {...item.fields, images, id}
        return room;
    });
    return tempItems;
}

    render() {
        return (
            <RoomContext.Provider value={{
               ...this.state,
               getRoom: this.getRoom, handleChange: this.handleChange
            }
            }>
                {this.props.children}
            </RoomContext.Provider>
        )
    }
}

const RoomConsumer = RoomContext.Consumer;

export function withRoomConsumer(Component) {
    return function ConsumerWrapper(props) {
        return (
        <RoomConsumer>
            {value => <Component {...props} context = {value} />}
        </RoomConsumer>
        )
    }
}
export {RoomProvider, RoomConsumer, RoomContext};