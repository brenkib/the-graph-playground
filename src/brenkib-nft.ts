import {Transfer as TransferEvent, BrenkibNFT} from "../generated/BrenkibNFT/BrenkibNFT"
import {Token, Owner} from "../generated/schema"
import {BigInt} from "@graphprotocol/graph-ts";
import { TokenMetadata as TokenMetadataTemplate } from '../generated/templates'

export function handleTransfer(event: TransferEvent): void {
    if (event.params && event.params.tokenId && event.address) {
        let token = Token.load(event.params.tokenId.toString() + "-" + event.address.toHex())
        if (!token) {
            token = new Token(event.params.tokenId.toString())
            token.tokenID = event.params.tokenId

            const nftMetadataURI = BrenkibNFT.bind(event.address).tokenURI(event.params.tokenId);
            token.tokenURI = "uGsun6UTDCuqpCj9nC9yQALz98tWVUJZ2GJItUBsB3U";
            token.ardriveURI = nftMetadataURI;
            TokenMetadataTemplate.create(nftMetadataURI)
        }

        token.createdAtTimestamp = event.block.timestamp
        token.owner = event.params.to;
        token.save()

        let newOwner = Owner.load(event.params.to);
        let prevOwner = Owner.load(event.params.from);


        let newOwnerBalance = BigInt.fromI32(1);
        if (!newOwner) {
            newOwner = new Owner(event.params.to);
            newOwner.balance = newOwnerBalance;
        } else {
            // Assembly does not allow other way to increment
            newOwnerBalance = newOwner.balance;
            newOwner.balance = newOwnerBalance + BigInt.fromI32( 1);
        }

        let prevOwnerBalance = BigInt.fromI32(0);
        if (!prevOwner) {
            prevOwner = new Owner(event.params.from);
            prevOwner.balance = prevOwnerBalance;
        } else {
            // Assembly does not allow other way to increment
            prevOwnerBalance = prevOwner.balance;
            prevOwner.balance = prevOwnerBalance + BigInt.fromI32( - 1);
        }


        newOwner.save();
        prevOwner.save()
    }
}
