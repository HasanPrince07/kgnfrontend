import { NavLink } from "react-router-dom";

const NAV_LINKS = [
    { name: "dashboard", path: "dashboard" },
    { name: "user", path: "usermanagement" },
    { name: "main", path: "mainmanagement" },
    { name: "history", path: "historymanagement" },
    { name: "number", path: "numbermanagement" },
    { name: "certificate", path: "certificatemanagement" },
    { name: "policy", path: "policymanagement" },
    { name: "faqs", path: "faqsmanagement" },
    { name: "wallpaper", path: "wallpapermanagement" },
    { name: "about", path: "aboutmanagement" },
    { name: "product", path: "productmanagement" },
    { name: "career", path: "careermanagement" },
    { name: "apply", path: "applymanagement" },
    { name: "query", path: "querymanagement" },
    { name: "contact", path: "contactmanagement" }
]

function Sidebar() {
    return (
        <>
            <div className="col-sm-3 d-sm-block d-none px-0 py-2" id="sidebar-section">
                {NAV_LINKS.map((link) => (
                    <NavLink key={link.path} to={`/${link.path}`} className="btn form-control text-uppercase fw-bold rounded-0 my-1 shadow-none">
                        {link.name}
                    </NavLink>
                ))}
            </div>
        </>
    );
}

export default Sidebar;