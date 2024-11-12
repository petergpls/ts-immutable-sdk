/* tslint:disable */
/* eslint-disable */
/**
 * Immutable zkEVM API
 * Immutable Multi Rollup API
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


// May contain unused imports in some cases
// @ts-ignore
import { ImmutableVerificationStatusEnum } from './immutable-verification-status-enum';

/**
 * 
 * @export
 * @interface SeaportERC1155CollectionItem
 */
export interface SeaportERC1155CollectionItem {
    /**
     * Token type user is offering, which in this case is ERC1155Collection
     * @type {string}
     * @memberof SeaportERC1155CollectionItem
     */
    'type': SeaportERC1155CollectionItemTypeEnum;
    /**
     * Address of ERC1155 token
     * @type {string}
     * @memberof SeaportERC1155CollectionItem
     */
    'contract_address': string;
    /**
     * The URL of the collection image
     * @type {string}
     * @memberof SeaportERC1155CollectionItem
     */
    'image_url': string;
    /**
     * The name of the collection
     * @type {string}
     * @memberof SeaportERC1155CollectionItem
     */
    'contract_name'?: string | null;
    /**
     * A string representing the total units of an ERC1155 token which the user is buying
     * @type {string}
     * @memberof SeaportERC1155CollectionItem
     */
    'amount': string;
    /**
     * 
     * @type {ImmutableVerificationStatusEnum}
     * @memberof SeaportERC1155CollectionItem
     */
    'immutable_verification_status': ImmutableVerificationStatusEnum;
}

export const SeaportERC1155CollectionItemTypeEnum = {
    Erc1155Collection: 'ERC1155Collection'
} as const;

export type SeaportERC1155CollectionItemTypeEnum = typeof SeaportERC1155CollectionItemTypeEnum[keyof typeof SeaportERC1155CollectionItemTypeEnum];


