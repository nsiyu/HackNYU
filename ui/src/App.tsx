import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from "./components/LandingPage"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
