// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.getNumUsers(); //<<
      self.getNumTrans();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  getNumUsers: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getNumUsers.call({from: account});
    }).then(function(value) {

      var numUsers = document.getElementById("len"); //<<
      numUsers.innerHTML = value.valueOf(); //<<
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting numUsers; see log.");
    });
  },

  getNumTrans: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getNumTrans.call({from: account});
    }).then(function(value) {

      var numTrans = document.getElementById("len2"); //<<
      numTrans.innerHTML = value.valueOf(); //<<
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting numTrans; see log.");
    });
  },

  getRating: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;

      var getterID = parseInt(document.getElementById("getter_ID").value);
      return meta.getRating.call(getterID, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting rating; see log.");
    });
  },

  addUser: function() {
    var self = this;

    var user_id = parseInt(document.getElementById("user_id").value);

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.addUser(user_id, {from: account});
    }).then(function() {
      self.setStatus("User Added!");
      self.getNumUsers(); //<<
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error whilst adding User; see log.");
    });
  },

  addTransaction: function() {
    var self = this;

    var trans_id = parseInt(document.getElementById("add_tid").value);
    var timestamp = parseInt(document.getElementById("add_tt").value);
    var borr_id = parseInt(document.getElementById("add_tbow").value);
    var len_id = parseInt(document.getElementById("add_tlen").value);
    var amt = parseInt(document.getElementById("add_tam").value);
    var inter = parseInt(document.getElementById("add_tin").value);
    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.addTransaction(1, 1, 1, 1, 1, 1, {from: account});
    }).then(function() {
      self.setStatus("Transaction Added!");
      //self.getNumTrans();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error whilst adding Transaction; see log.");
    });
  },


  closeTransaction: function() {
    var self = this;
    
    var close_id = parseInt(document.getElementById("close_tid").value);
    var status = parseInt(document.getElementById("close_ts").value);

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.changeKarma(changed_id, karma_amt, {from: account});
    }).then(function() {
      self.setStatus("Transaction Closed!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error whilst adding User; see log.");
    });
  },

  changeKarma: function() {
    var self = this;
    
    var changed_id = parseInt(document.getElementById("changed_id").value);
    var karma_amt = parseInt(document.getElementById("karma_amt").value);

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.changeKarma(changed_id, karma_amt, {from: account});
    }).then(function() {
      self.setStatus("Karma Changed!");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error whilst adding User; see log.");
    });
  }



};




window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
