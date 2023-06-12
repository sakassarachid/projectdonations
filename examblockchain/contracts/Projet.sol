// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

struct Donation {
    address donor;
    uint256 amount;
}

struct ProjectStr {
    uint256 id;
    string title;
    string description;
    uint256 amountRaised;
    address payable owner;
    Donation[] donations;
}

contract Project {
    uint256 public nbrProjects;
    ProjectStr[] public projects;
    address public smowner;

    modifier onlyOwner() {
        require(msg.sender == smowner, "Only the owner can call this function");
        _;
    }

    constructor() {
        smowner = msg.sender;
        nbrProjects = 0;
    }

    function createProject(string memory _title, string memory _description) public {

        ProjectStr storage project = projects.push();
        project.id = nbrProjects + 1;
        project.title = _title;
        project.description = _description;
        project.amountRaised = 0;
        project.owner = payable(msg.sender);

        nbrProjects++;
    }

    function donate(uint256 _idProject, uint256 _amount) public payable {
        require(_idProject <= nbrProjects, "ID doesn't exist");

        ProjectStr storage project = projects[_idProject - 1];
        project.amountRaised += _amount;

        Donation memory donation;
        donation.donor = msg.sender;
        donation.amount = _amount;
        project.donations.push(donation);

        // Send the donated amount to the project owner
        project.owner.transfer(_amount);
    }

    function getDonors(uint256 _idProject) public view returns (address[] memory, uint256[] memory) {
        require(_idProject <= nbrProjects, "ID doesn't exist");

        ProjectStr storage project = projects[_idProject - 1];
        uint256 numDonors = project.donations.length;

        address[] memory donorAddresses = new address[](numDonors);
        uint256[] memory donationAmounts = new uint256[](numDonors);

        for (uint256 i = 0; i < numDonors; i++) {
            Donation memory donation = project.donations[i];
            donorAddresses[i] = donation.donor;
            donationAmounts[i] = donation.amount;
        }

        return (donorAddresses, donationAmounts);
    }

  
}
