import { ABI } from "./config.js";

let web3js;
let account;
let contract;
let nbrProjects;
let projects = [];

let main = async () => {
  if (!window.ethereum)
    return alert('Please install MetaMask');
  
  window.ethereum.on('accountsChanged', (accounts) => {
    account = accounts[0];
    connectedAddress.innerText = account;
    loadTickets();
  });
  
  web3js = new Web3(window.ethereum);
  account = (await web3js.eth.requestAccounts())[0];
  console.log(account);
  connectedAddress.innerText = account;
  contract = new web3js.eth.Contract(ABI);
  console.log(contract);
  
  nbrProjects = await contract.methods.nbrProjects.call();
  console.log('nbrProjects', nbrProjects);
  await loadTickets();
  var createButton = document.getElementById('createModal');

  createButton.addEventListener('click', createProject);
}

main();

// Function to load projects from the smart contract
const loadTickets = async () => {
  // Assuming you have a reference to your smart contract instance named `contract`
  
  // Call the function in your smart contract to get the number of projects
  for (var i = 0; i < nbrProjects; i++) {
    // Call the function in your smart contract to get the project details
    contract.methods.Project(i).call().then(function(project) {
      // Create HTML elements to display the project details
      var col = document.createElement('div');
      col.className = 'col';
      var card = document.createElement('div');
      card.className = 'card shadow-sm';
      var title = document.createElement('h2');
      title.className = 'projectTitle';
      title.innerText = project.title;
      var cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      var description = document.createElement('p');
      description.className = 'card-text textProject';
      description.innerText = project.description;
      var buttonGroup = document.createElement('div');
      buttonGroup.className = 'btn-group';
      var donateButton = document.createElement('button');
      donateButton.className = 'btn btn-success';
      donateButton.type = 'button';
      donateButton.innerText = 'Donate';
      var donorsButton = document.createElement('button');
      donorsButton.className = 'btn btn-primary';
      donorsButton.type = 'button';
      donorsButton.innerText = 'List of donors';

      // Append the elements to the DOM
      buttonGroup.appendChild(donateButton);
      buttonGroup.appendChild(donorsButton);
      cardBody.appendChild(description);
      cardBody.appendChild(buttonGroup);
      card.appendChild(title);
      card.appendChild(cardBody);
      col.appendChild(card);
      projectsContainer.appendChild(col);
      
      donateButton.addEventListener('click', async () => {
        const amount = parseFloat(prompt('Enter the amount in ETH to donate'));
        if (!isNaN(amount) && amount > 0) {
          try {
            await contract.methods.donate(projectId, web3.utils.toWei(amount.toString(), 'ether')).send({
              from: account,
              value: web3.utils.toWei(amount.toString(), 'ether'),
              gas: 200000,
              gasPrice: await web3js.eth.getGasPrice()
            });
            alert('Donation successful');
          } catch (error) {
            console.error(error);
            alert('Failed to donate');
          }
        } else {
          alert('Invalid donation amount');
        }
      });

      donorsButton.addEventListener('click', async () => {
        try {
          const donors = await contract.methods.getDonors(projectId).call();

          let donorsList = '';
          for (let i = 0; i < donors[0].length; i++) {
            const donorAddress = donors[0][i];
            const donationAmount = donors[1][i];
            donorsList += `${i + 1}- ${donorAddress} : ${web3.utils.fromWei(donationAmount.toString(), 'ether')} ETH\n`;
          }
          alert(donorsList);
        } catch (error) {
          console.error(error);
          alert('Failed to get donors');
        }
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
}

// Function to handle the creation of a new project
let createProject = async () => {
  // Function to handle the creation of a new project
  var titleInput = document.querySelector('#createModal input[placeholder="title"]');
  var descriptionInput = document.querySelector('#createModal textarea[placeholder="description"]');

  var title = titleInput.value;
  var description = descriptionInput.value;

  // Assuming you have a reference to your smart contract instance named `contract`

  // Call the function in your smart contract to create a new project
  contract.methods.createProject(title, description).send().then(function(result) {
    // Reload the page to display the newly created project
    location.reload();
  }).catch(function(error) {
    console.error(error);
  });
  $('#createModal').modal('hide');
  await loadTickets();

}
