
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { Layout } from '../components/Layout'
import { Dashboard } from '../components/Dashboard'
import { Editor } from '../components/Editor'
import { Settings } from '../components/Settings'
import { z } from 'zod'

// 1. Create Root Route (Layout wrapper)
export const rootRoute = createRootRoute({
    component: () => (
        <Layout>
            <Outlet />
        </Layout>
    ),
})

// 2. Define Children Routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: Dashboard,
})

const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/settings',
    component: Settings,
})

const editorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/editor/$docId',
    component: EditorWrapper,
    validateSearch: z.object({}).optional(), // No search params for now
})

// Wrapper to extract params for Editor
function EditorWrapper() {
    const { docId } = editorRoute.useParams()
    return <Editor docId={docId} />
}

// 3. Create Route Tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    dashboardRoute,
    settingsRoute,
    editorRoute
])

// 4. Create Router
export const router = createRouter({ routeTree })

// Register for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
