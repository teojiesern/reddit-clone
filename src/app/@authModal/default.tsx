// since parallel route we are able to render one or more pages in the same layout, and this we are going to implement intersecting routes in which we will intercept the route that it is going to be navigated to, but instead we will render out the parallel route too, but if let's say we did not find anything to intercept, we would return null because we don't want a page to be rendered out if we are not intercepting in this case
// by convention we will create a folder with the naming convention @something to define a parallel route, and then inside the parallel route if we are going to intecept any route, we will define (.)sign-in for example which means we want to intercept the sign-in page which is the at the same level as this folder( that is what the (.) means, which follows file system convention where .. means going to the parent directory )
export default function Default() {
    return null;
}
