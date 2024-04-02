import { Route, Routes } from "react-router";
import "./App.css";
import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OpenRoute from './components/core/Auth/OpenRoute'
import ForgotPassword from "./pages/ForgotPassword";
import Error from './pages/Error'
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from './components/core/Auth/PrivateRoute'
import Settings from './components/core/Dashboard/Settings/index'
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import Cart from "./components/core/Dashboard/Cart";
import {ACCOUNT_TYPE} from './utils/constants';
import { useSelector } from "react-redux";
import MyCourses from "./components/core/Dashboard/MyCourses";
import AddCourse from './components/core/Dashboard/AddCourse/index'
import EditCourse from "./components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from './components/core/ViewCourse/VideoDetails'
import CourseDetails from "./pages/CourseDetails";
import Instructor from "./components/core/Dashboard/InstructorDashboard/Instructor";

function App() {

  const {user} = useSelector((state) => state.profile);

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='about' element={<About/>}/>
        <Route path='contact' element={<Contact/>}/>
        <Route path='catalog/:catalogName' element={<Catalog/>}/>
        <Route path='courses/:courseId' element={<CourseDetails/>}/>

        <Route 
          path='login' 
          element={
            <OpenRoute>
              <Login/>
            </OpenRoute>
          }>
        </Route>
        
        <Route 
          path='signup' 
          element={
            <OpenRoute>
              <Signup/>
            </OpenRoute>
          }>
        </Route>

        <Route 
          path='forgot-password' 
          element={
            <OpenRoute>
              <ForgotPassword/>
            </OpenRoute>
          }>
        </Route>

        <Route 
          path='update-password/:id' 
          element={
            <OpenRoute>
              <UpdatePassword/>
            </OpenRoute>
          }>
        </Route>

        <Route 
          path='verify-email' 
          element={
            <OpenRoute>
              <VerifyEmail/>
            </OpenRoute>
          }>
        </Route>

        <Route
          element={
            <PrivateRoute>
              <Dashboard/>
            </PrivateRoute>
          }
        >

          <Route
            path='dashboard/my-profile' 
            element={<MyProfile/>}
          ></Route>

          <Route
            path='dashboard/settings' 
            element={<Settings/>}
          ></Route>

          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route
                  path='dashboard/enrolled-courses' 
                  element={<EnrolledCourses/>}
                ></Route>

                <Route
                  path='dashboard/cart' 
                  element={<Cart/>}
                ></Route>
              </>
            )
          }

          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route
                  path='dashboard/my-courses' 
                  element={<MyCourses/>}
                ></Route>

                <Route path="dashboard/instructor" element={<Instructor />} />

                <Route
                  path='dashboard/add-course' 
                  element={<AddCourse/>}
                ></Route>

                <Route
                  path='dashboard/edit-course/:courseId' 
                  element={<EditCourse/>}
                ></Route>
              </>
            )
          }

        </Route>
        
        <Route 
          element={
            <PrivateRoute>
              <ViewCourse/>
            </PrivateRoute>
          }
        >
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route
                  path='view-course/:courseId/section/:sectionId/sub-section/:subSectionId'
                  element={<VideoDetails/>}
                >
                </Route>
              </>
            )
          }
        </Route>

        <Route
          path='*'
          element={
            <Error/>
          }
        ></Route>
      </Routes>
    </div>
  );
}

export default App;
