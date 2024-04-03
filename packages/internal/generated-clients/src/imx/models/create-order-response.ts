/* tslint:disable */
/* eslint-disable */
/**
 * Immutable X API
 * Immutable X API
 *
 * The version of the OpenAPI document: 3.0
 * Contact: support@immutable.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */



/**
 * 
 * @export
 * @interface CreateOrderResponse
 */
export interface CreateOrderResponse {
    /**
     * ID of the created order
     * @type {number}
     * @memberof CreateOrderResponse
     */
    'order_id': number;
    /**
     * Request ID as a reference for an asynchronous order creation request
     * @type {string}
     * @memberof CreateOrderResponse
     */
    'request_id'?: string;
    /**
     * Status of the created order
     * @type {string}
     * @memberof CreateOrderResponse
     */
    'status': string;
    /**
     * Timestamp of the created order
     * @type {number}
     * @memberof CreateOrderResponse
     */
    'time': number;
}

