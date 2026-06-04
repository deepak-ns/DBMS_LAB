import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Components/Home";
import Notifications from "./Components/Notifications";
import Profile from "./Components/Profile";
import Facilities from "./Components/Facilities";
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import EventsPage from "./Components/EventsPage";
import Book from "./Components/Booking/Book";
import WithdrawWalletPage from "./Components/Wallet/Withdraw";
import AddWalletPage from "./Components/Wallet/AddWallet";
import SlotsBooked from "./Components/Booking/SlotsBooked";
import AddEvent from "./Components/EventAdmin/AddEvent";
import LLMModel from "./Components/LLMModel";
import Equipments from "./Components/Equipments";
import FacilityPage from "./Components/Facilities/FacilityPage";
import AddSlot from "./Components/CourtSlotAdmin/AddSlot";
import ManageSlot from "./Components/CourtSlotAdmin/ManageSlot";
import AddEquipment from "./Components/EquipmentAdmin/AddEquipment";
import Rent from "./Components/Rental/Rent";
import ManageRent from "./Components/Rental/ManageRent";
import MyRent from "./Components/Rental/MyRent";
import SportsTeam from "./Components/SportsTeam";
import AddMember from "./Components/SportsAdmin/AddMember";
import StudentTrack from "./Components/SportsAdmin/StudentTrack";
import AddFacility from "./Components/Facilities/AddFacility";
import GetAnnouncement from "./Components/Announcement/GetAnnouncement";
import CreateAnnouncement from "./Components/Announcement/CreateAnnouncement";
import About from "./Components/About";
import Contact from "./Components/Contact";
import Sports from "./Components/Sports";
import SportFacilities from "./Components/Facilities/SportFacilities";
import MyHistory from "./Components/MyHistory";

function App() {
  return (
   <>
   <BrowserRouter>
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/notifications" element={<Notifications/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/history" element={<MyHistory/>}/>
    <Route path="/events" element={<EventsPage/>}/>
    <Route path="/facilities" element={<Facilities/>}/>
    <Route path="/sports" element={<Sports/>}/>
    <Route path="/equipments" element={<Equipments/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/signup" element={<SignUp/>}/>
    <Route path="/facility/:facilityId/book" element={<Book/>}/>
    <Route path="/wallet/topup" element={<AddWalletPage/>}/>
    <Route path="/wallet/withdraw" element={<WithdrawWalletPage/>}/>
    <Route path="/facility/:facilityId/cancel-booking" element={<SlotsBooked/>}/>
    <Route path="/add-event" element={<AddEvent/>}/>
    <Route path="/llm-model" element={<LLMModel/>}/>
    <Route path="/facilities/:facilityId" element={<FacilityPage/>}/>
    <Route path="/facility/:facilityId/add-slot" element={<AddSlot/>}/>
    <Route path="/facility/:facilityId/manage-slots" element={<ManageSlot/>}/>
    <Route path="/add-equipment" element={<AddEquipment/>}/> 
    <Route path="/rent-equipment/:equipmentId" element={<Rent/>}/>
    <Route path="/manage-rentals/:equipmentId" element={<ManageRent/>}/>
    <Route path="/my-rentals/:equipmentId" element={<MyRent/>}/>
    <Route path="/sports/:sportId/team" element={<SportsTeam/>}/>
    <Route path="/sports/:sportId/add-member" element={<AddMember/>}/>
    <Route path="/sports/:sportId/student/:studentId" element={<StudentTrack/>}/>
    <Route path="/facilities/create" element={<AddFacility/>}/> 
    <Route path="/announcements/:sportId" element={<GetAnnouncement/>}/>
    <Route path="/announcements/:sportId/create" element={<CreateAnnouncement/>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="/contact" element={<Contact/>}/>
     <Route path="/sports/:sportId/facilities" element={<SportFacilities/>}/>
   </Routes>
   </BrowserRouter>
   </>
  );
}

export default App;
