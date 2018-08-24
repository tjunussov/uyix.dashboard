export default {
  populate(db) {

    console.log("Populating")
    
    //-------------

    db.clients.add({
      id:'811104301997',
      hid:'0006448025',
      name:'Timur Junussov',
      meal:false,
      drink:false,
      count:0,
      meta_:{ created:new Date(), updated:new Date() },
    })

  } // end of method
}
