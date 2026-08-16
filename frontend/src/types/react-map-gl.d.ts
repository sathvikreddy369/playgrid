declare module 'react-map-gl' {
  import * as React from 'react';

  export interface MapProps {
    longitude?: number;
    latitude?: number;
    zoom?: number;
    onMove?: (evt: any) => void;
    onClick?: (evt: any) => void;
    mapStyle?: string;
    mapboxAccessToken?: string;
    cursor?: string;
    children?: React.ReactNode;
  }

  export interface MarkerProps {
    longitude: number;
    latitude: number;
    anchor?: string;
    children?: React.ReactNode;
  }

  export const Map: React.ComponentType<MapProps>;
  export const Marker: React.ComponentType<MarkerProps>;
  export default Map;
}
