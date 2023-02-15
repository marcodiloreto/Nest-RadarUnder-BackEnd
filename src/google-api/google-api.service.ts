import { Client, GeocodeResponse, Language, PlaceAutocompleteResponse, ReverseGeocodeResponse, ReverseGeocodeResponseData } from "@googlemaps/google-maps-services-js";
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios'
@Injectable()
export class GoogleApiService {


    constructor(private readonly client: Client) {
    }

    async autocompletePlaces(text: string, lat: number, lng: number) {

        var response: PlaceAutocompleteResponse
        await this.client.placeAutocomplete({
            params: {
                input: text,
                language: 'es',
                components: ['country:ar'],
                key: process.env.GOOGLE_API_KEY,
                origin: { lat, lng },
            },
            method: 'GET'
        }).then(res => response = res)
            .catch(err => console.log(err))

        const { predictions } = response.data

        return predictions.sort((a, b) => a.distance_meters - b.distance_meters)
    }

    async geocode(place: string) {
        var response: GeocodeResponse
        await this.client.geocode({
            params: {
                place_id: place,
                key: process.env.GOOGLE_API_KEY,
            },
            method: 'GET'
        }).then(res => response = res)
            .catch(err => console.log(err))

        return {
            location: response.data.results[0].geometry.location,
            viewport: response.data.results[0].geometry.viewport,
        }
    }

    async reverseGeocode(lat: number, lng: number) {
        var response: ReverseGeocodeResponseData
        await this.client.reverseGeocode({
            params: {
                language: Language.es,
                latlng: { lat, lng },
                key: process.env.GOOGLE_API_KEY,
            },
            method: 'GET'
        }).then(res => {
            response = res.data

        })
            .catch(err => console.log(err))


        return {
            lat: response.results[0].geometry.location.lat,
            lng: response.results[0].geometry.location.lng,
            address: response.results[0].formatted_address,
            viewport: response.results[0].geometry.viewport
        }
    }
}
