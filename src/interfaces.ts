import { Location } from "history";
import * as toRegexp from "path-to-regexp";

export interface Indexer {
    [key: string]: string;
}

export interface RouteKey {
    name: string;
}

export interface Route {
    pattern?: toRegexp.PathRegExp;
    keys?: RouteKey[];
}
export interface IRouted {
    route?: Route;
}

export interface RoutedView extends React.ReactElement<IRouted> {

}

export interface RouterProps extends React.Props<any> {
    views: RoutedView[];
}

export interface RouterState {
    location: Location;
}

export interface RouteError extends URIError {
    status?: number;
}