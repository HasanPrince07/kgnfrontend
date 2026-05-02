import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify';

const Header = lazy(() => import("./common/Header"));
const Footer = lazy(() => import("./common/Footer"));
const Adminheader = lazy(() => import("./common/Adminheader"));
const ScrollToTop = lazy(() => import("./common/ScrollToTop"));
const Loader = lazy(() => import("./common/Loader"));

const Home = lazy(() => import("./user/home/Home"));
const About = lazy(() => import("./user/about/About"));
const Product = lazy(() => import("./user/product/Product"));
const Career = lazy(() => import("./user/career/Career"));
const Careerdetail = lazy(() => import("./user/careerdetail/Careerdetail"));
const Contact = lazy(() => import("./user/contact/Contact"));
const Dashboard = lazy(() => import("./admin/Dashboard"));
const User = lazy(() => import("./admin/User"));
const Main = lazy(() => import("./admin/Main"));
const History = lazy(() => import("./admin/History"));
const Number = lazy(() => import("./admin/Number"));
const Certificate = lazy(() => import("./admin/Certificate"));
const Policy = lazy(() => import("./admin/Policy"));
const Faqs = lazy(() => import("./admin/Faqs"));
const Wallpaper = lazy(() => import("./admin/Wallpaper"));
const AboutAdmin = lazy(() => import("./admin/About"));
const ProductAdmin = lazy(() => import("./admin/Product"));
const CareerAdmin = lazy(() => import("./admin/Career"));
const Apply = lazy(() => import("./admin/Apply"));
const Query = lazy(() => import("./admin/Query"));
const ContactAdmin = lazy(() => import("./admin/Contact"));
const Login = lazy(() => import("./admin/login/Login"));

const Notfound = lazy(() => import("./common/Notfound"));

const UserLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

const AdminLayout = () => (
  <>
    <Adminheader />
    <Outlet />
  </>
);

const ProtectedRoute = () => {

  const [auth, setAuth] = useState({ isChecked: false, isAuthenticated: false });

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/admin/checkAuth", {
          method: "GET",
          credentials: "include",
        });
        const resData = await res.json();
        if (res.ok) {
          setAuth({ isChecked: true, isAuthenticated: true });
        } else {
          toast(resData.message, { type: "error" });
          setAuth({ isChecked: true, isAuthenticated: false });
        }
      } catch (error) {
        toast("Network error, please check your internet", { type: "error" });
        console.log("Error during authentication:", error);
        setAuth({ isChecked: true, isAuthenticated: false });
      }
    };
    verifyUser();
  }, []);

  if (!auth.isChecked) {
    return <Loader />;
  }

  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;

}

function App() {
  return (
    <Router>
      <ToastContainer position='top-center' />
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/product/:id?' element={<Product />} />
            <Route path='/career' element={<Career />} />
            <Route path='/career_detail/:id' element={<Careerdetail />} />
            <Route path='/contact' element={<Contact />} />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/usermanagement' element={<User />} />
              <Route path='/mainmanagement' element={<Main />} />
              <Route path='/historymanagement' element={<History />} />
              <Route path='/numbermanagement' element={<Number />} />
              <Route path='/certificatemanagement' element={<Certificate />} />
              <Route path='/policymanagement' element={<Policy />} />
              <Route path='/faqsmanagement' element={<Faqs />} />
              <Route path='/wallpapermanagement' element={<Wallpaper />} />
              <Route path='/aboutmanagement' element={<AboutAdmin />} />
              <Route path='/productmanagement' element={<ProductAdmin />} />
              <Route path='/careermanagement' element={<CareerAdmin />} />
              <Route path='/applymanagement' element={<Apply />} />
              <Route path='/querymanagement' element={<Query />} />
              <Route path='/contactmanagement' element={<ContactAdmin />} />
            </Route>
          </Route>
          <Route path='*' element={<Notfound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;