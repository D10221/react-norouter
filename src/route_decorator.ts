import * as React from "react";
import ComponentClass = React.ComponentClass;
import { IRouted } from "./interfaces";
import { addRoute } from "./router";

export function Routed(path:  string) {
    return < TComponent extends ComponentClass<TProps>& Function, TProps extends React.Props<any>&IRouted>(Component: TComponent): TComponent => {
        addRoute(Component, path);
        return Component;
    };
}