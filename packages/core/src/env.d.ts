import { Emitter } from "mitt";
import { PhecdaEvents, PhecdaNameSpace } from "./types";

export {}

declare global {
    interface Window {
        __PHECDA_MODEL__: string[];
        __PHECDA_EMIT__:Emitter<PhecdaEvents>
        __PHECDA_NAMESPACE__:PhecdaNameSpace

        [key:string]:any
    }
}