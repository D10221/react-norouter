import * as React from "react";
import { history } from "./history";
import { Route, RouteError, RouterProps, RouterState, RoutedView } from "./interfaces";
import * as toRegexp from "path-to-regexp";

/**
 * Holds DisplayName, "/path/"
 */
export const routes = new Map<string, string>();


export function addRoute(Component: any, path: string) {
    const name = getName(Component);
    if (!name) { throw new Error("Component must have a name/displayname/or type will be used") }
    routes.set(name, path);
}

export const routeMap: { from: string, to: string }[] = [];

export function navigate(url: string) {
    let map = routeMap
        .find(x => matchURI(toRoute(x.from), url) != null);
    history.push(map ? map.to : url);
}

export class Router extends React.Component<RouterProps, RouterState> {

    subscription: () => void;

    constructor(props: RouterProps, context?: any) {
        super(props, context);
        this.state = {
            location: history.location
        };
    }

    componentDidMount = () => {
        let self = this;
        this.subscription = history.listen((location, action) => {
            if (action) { }
            self.setState({
                location
            });
        });
    }

    componentWillUnmount = () => {
        this.subscription();
    }

    render() {
        const isMatch = (v: RoutedView) => {
            let viewName = getName(v);
            let route = v.props.route || toRoute(routes.get(viewName));
            if (!route) {
                throw new Error(`No Route found for ${viewName}`);
            }
            let path = this.state.location.pathname;
            let params = matchURI(v.props.route || route, path);
            return params && typeof params !== "undefined";
        };
        return this.props.views
            .filter(isMatch)[0] || (<NotFound />);
    }
}

function getName(x: any) {
    debugger;
    if (!x) return null;
    if (x.displayName) { return x.displayName; };
    if (x.type && x.type.displayName) { return x.type.displayName; };
    if (x.type && x.type.name) { return x.type.name; };
    if (x.name) return x.name;
    return null;
}

const NotFound = () => {
    return (
        <div>Not Found</div>
    );
};

function isString(x: any): x is string {
    return typeof x === "string";
}

function decodeParam(val: string | string[]) {
    if (!(isString(val) || val.length === 0)) {
        return val;
    }

    try {
        return decodeURIComponent(val as string);
    } catch (err) {
        if (err instanceof URIError) {
            err.message = `Failed to decode param '${val}'`;
            (err as RouteError).status = 400;
        }

        throw err;
    }
}

/**
 *  Match the provided URL path pattern to an actual URI string. For example:
 *  matchURI({ path: '/posts/:id' }, '/dummy') => null
 *  matchURI({ path: '/posts/:id' }, '/posts/123') => { id: 123 }
 */
export function matchURI(route: Route, path: string) {
    const match = route.pattern.exec(path);

    if (!match) {
        return null;
    }

    const params = Object.create(null);

    for (let i = 1; i < match.length; i++) {
        params[route.keys[i - 1].name] = match[i] !== undefined ? decodeParam(match[i]) : undefined;
    }

    return params;
}

export function toRoute(path: string) {
    let keys: any = [];
    return {
        pattern: toRegexp(path, keys),
        keys,
    };
}
