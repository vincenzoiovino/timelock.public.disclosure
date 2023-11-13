// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Timelock.Public.Disclosure
 * @dev Implements a public disclosure system for timelock.zone over Ethereum
 */

contract TimelockPublicDisclosure {
    struct Document {
        uint256 ut; // unix time of when it will be possible to read the document
        bytes8 CT; // the ciphertext (actually the hash or tinyurl from which it is possible to retrieve the ciphertext)
    }
    mapping(uint256 => Document) public documents; // each document is associated with the unix time in which it is deposited

    /**
     * @dev At construction time we can set some parameters in the future
     *
     */
    constructor() {}

    /**
     * @dev Publish a document annotated with unix time ut and ciphertext CT (see above)
     * @param A, ut and CT values representing resp. the unix time identifier (see above), the time in which the document can be decrypted and the ciphertext
     *
     */
    function PublishDocument(
        uint256 A,
        uint256 ut,
        bytes8 CT
    ) external payable {
        require(documents[A].CT == 0);
        documents[A].ut = ut;
        documents[A].CT = CT;
    }

    function get_document(uint256 A) public view returns (Document memory) {
        return documents[A];
    }
}

