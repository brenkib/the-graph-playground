import {Transfer as TransferEvent, BrenkibNFT} from "../generated/BrenkibNFT/BrenkibNFT"
import {Token, Owner, TokenMetadata} from "../generated/schema"
import {BigInt, json, Bytes, dataSource} from "@graphprotocol/graph-ts";
import { TokenMetadata as TokenMetadataTemplate } from '../generated/templates'

export function handleTransfer(event: TransferEvent): void {
    if (event.params && event.params.tokenId && event.address) {
        let token = Token.load(event.params.tokenId.toString() + "-" + event.address.toHex())
        if (!token) {
            token = new Token(event.params.tokenId.toString())
            token.tokenID = event.params.tokenId

            const nftMetadataURI = `https://arweave.net/uGsun6UTDCuqpCj9nC9yQALz98tWVUJZ2GJItUBsB3U`;
            token.tokenURI = "uGsun6UTDCuqpCj9nC9yQALz98tWVUJZ2GJItUBsB3U";
            token.ardriveURI = nftMetadataURI;

            TokenMetadataTemplate.create(nftMetadataURI)
        }

        token.createdAtTimestamp = event.block.timestamp
        token.owner = event.params.to;
        token.save()

        let owner = Owner.load(event.params.to);
        let balance = BigInt.fromI32(1);
        if (!owner) {
            owner = new Owner(event.params.to);
            owner.balance = balance;
        } else {
            balance = owner.balance;
            owner.balance = balance + BigInt.fromI32( 1);
        }
        owner.save();
    }
}

export function handleMetadata(content: Bytes): void {
    let tokenMetadata = new TokenMetadata(dataSource.stringParam())
    const value = json.fromBytes(content).toObject()
    if (value) {
        const image = value.get('image')
        const name = value.get('name')
        const description = value.get('description')
        const externalURL = value.get('external_url')

        if (name && image && description && externalURL) {
            tokenMetadata.name = name.toString()
            tokenMetadata.image = image.toString()
            tokenMetadata.externalURL = externalURL.toString()
            tokenMetadata.description = description.toString()
        }

        tokenMetadata.save()
    }
}