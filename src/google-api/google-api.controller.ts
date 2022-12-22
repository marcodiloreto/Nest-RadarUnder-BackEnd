import { Controller, Get, ParseFloatPipe, Query } from '@nestjs/common';
import { GoogleApiService } from './google-api.service';

@Controller('googleApi')
export class GoogleApiController {

    constructor(private readonly GoogleService: GoogleApiService) { }

    @Get('autocomplete')
    autocomplete(@Query('term') term: string, @Query('lat', ParseFloatPipe) lat: number, @Query('lng', ParseFloatPipe) lng: number) {
        return this.GoogleService.autocompletePlaces(term, lat, lng)
    }

    @Get("geocode")
    geocode(@Query('place') place: string) {
        return this.GoogleService.geocode(place)
    }

    @Get('reverseGeocode')
    reverseGeocode(@Query('lat', ParseFloatPipe) lat: number, @Query('lng', ParseFloatPipe) lng: number) {
        return this.GoogleService.reverseGeocode(lat, lng)
    }
}
