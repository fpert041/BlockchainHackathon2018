pragma solidity ^0.4.4;
contract MetaCoin {

    struct User {
        uint ID;
        int rating;
    }
    
    struct Transtaction {
        uint transID;
        uint timestamp; // days (or seconds, or anything you want) from an initial date
        uint borrower;
        uint lender;
        uint amount;
        uint interest;
        uint8 state; // 0 == open, 1 == settled, 2 or higher == defaulted; 
    }
    
    struct Record {
        bool init;
        User[] users;
        Transtaction[] transtactions;
    }

    address ratingAgent;
    mapping(address => Record) contexts;

    /// Create a new karma instance
    function MetaCoin() public {
        ratingAgent = msg.sender;
        contexts[ratingAgent].init = true;
    }
    
    //------------helpers-----------
    
    //// Remove transactions older than a certain timestamp 
    /// Note: on the ethereum blockchain this is not really userful
    /// in terms of  data protection, but it helps the logic of the system
    /// and it may be an interesting aspect for developing a different 
    /// blockchain
    function removeOldTransactions(uint beforeTimestamp)  public { 
        Record storage context  = contexts[msg.sender]; // assigns reference
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        
        if (context.transtactions.length == 0){ return;}

        for (uint i = 0; i<context.transtactions.length; i++){
            if(context.transtactions[i].timestamp < beforeTimestamp){
                context.transtactions[i] = context.transtactions[context.transtactions.length-1];
                delete context.transtactions[context.transtactions.length-1];
                context.transtactions.length--;
            }
        }
    }
    
    //------------initialisers-----------

    /// add User
    function addUser(uint inID) public {
        Record storage context  = contexts[msg.sender]; // assigns reference
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        
        if (context.users.length > 0)
        for(uint i = 0; i< context.users.length; i++){
            if(context.users[i].ID == inID){ return revert();} // don't push duplicates
        }
        
        User memory newUser; // temporary variable for initialisation purposes
        newUser.ID = inID;
        newUser.rating = 0;
        
        context.users.push(newUser); // push to storage
    }
    
    /// Close a transaction
    function addTransaction(uint inTransID, uint inTimestamp, uint borrowerID, uint lenderID, uint inAmount, uint inIntrest) public {
        Record storage context  = contexts[msg.sender]; // assigns reference
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        
        if (context.transtactions.length > 0)
        for(uint i = 0; i< context.transtactions.length; i++){
            if(context.transtactions[i].transID == inTransID){ return revert();} // don't push duplicates
        }
        
        Transtaction memory newTrans;
        newTrans.transID = inTransID; // unique transaction identifier
        newTrans.timestamp = inTimestamp;
        newTrans.borrower = borrowerID;
        newTrans.lender = lenderID;
        newTrans.amount = inAmount;
        newTrans.interest = inIntrest;
        newTrans.state = 0; // open transaction
        context.transtactions.push(newTrans);
        
        ///////////addTransaction(2,100,111,222,100,5)////////////
        return;
    }
    
    //------------setters-----------

    /// change karmaRating of the user with $(inID) by $(change)
    function changeKarma(uint inID, int256 change) public {
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        Record storage context = contexts[msg.sender];
        
        if (context.users.length > 0){
            for(uint i = 0; i<context.users.length; i++){
                if(context.users[i].ID == inID){
                    context.users[i].rating += change;
                    return;
                }
            }
        }
        revert();
        return;
    }
    
    function closeTransaction(uint inTransID, uint8 inState) public {
        Record storage context  = contexts[msg.sender]; // assigns reference
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        
        if(context.transtactions.length > 0)
        for(uint i = 0; i<context.transtactions.length; i++){
            if(context.transtactions[i].transID == inTransID){
                context.transtactions[i].state = inState;
                return;
            }
        }
        revert();
        return;
    }
    
    //------------getters-----------
    
    function getNumUsers() public constant returns (uint _len) {
        Record storage context  = contexts[msg.sender]; // assigns reference
    
        _len = context.users.length;
    }
    
    function getNumTrans() public constant returns (uint _len) {
        Record storage context  = contexts[msg.sender]; // assigns reference
    
        _len = context.transtactions.length;
    }

    function getRating(uint inID) public constant returns (int _rating) {
        Record storage context = contexts[msg.sender];
        if (msg.sender != ratingAgent || !context.init) return; // restricted access method
        
        if (context.users.length > 0) {
            for(uint i = 0; i<context.users.length; i++){
                if(context.users[i].ID == inID){
                    _rating = context.users[i].rating;
                    return;
                }
            }
        }
        revert();
        return;
    }
    
    function getTransactions(uint transID) public constant returns (uint _timestamp, uint _amt, bool _open, bool _repaid) {
        Record storage context = contexts[msg.sender];
        
        if (context.transtactions.length > 0){
            for(uint i = 0; i<context.transtactions.length; i++){
                if(context.transtactions[i].transID == transID){
                    _timestamp = context.transtactions[i].timestamp;
                    _amt = context.transtactions[i].amount;
                    _open = false;
                    _repaid = false;
                    uint8 status = context.transtactions[i].state;
                    if(status==0){ _open = true;}
                    if(status==1){ _repaid = true;}
                    return;
                }
            }
        }
        revert();
        return;
    }
    
}