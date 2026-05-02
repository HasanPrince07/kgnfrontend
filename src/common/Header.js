import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = ["home", "about", "product", "career", "contact"];

function Header() {

    const [headerModal, setHeaderModal] = useState(false);
    const [whatsapp, setWhatsapp] = useState("");
    const headerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (headerModal && headerRef.current && !headerRef.current.contains(event.target)) {
                setHeaderModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [headerModal]);

    const handleFetch = useCallback(async () => {
        try {
            const res = await fetch(`/user/fetchcontact`);
            const resData = await res.json();
            if (!res.ok) {
                if (res.status === 404) {
                    console.warn(resData.message);
                } else {
                    console.warn(resData.message);
                }
            } else {
                setWhatsapp(resData.data.whatsapp);
            }
        } catch (error) {
            console.log("Error during fetch contact data:", error);
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const toggleModal = () => setHeaderModal(prev => !prev);
    const openWhatsapp = () => { window.open(`https://wa.me/${whatsapp}`, "_blank"); }
    const closeModal = () => { setHeaderModal(false); }

    const renderLinks = (isMobile = false) =>
        NAV_LINKS.map((item) => (
            <li key={item} className={isMobile ? "d-block" : "d-inline-block"}>
                <NavLink
                    onClick={closeModal}
                    to={item === "home" ? "/" : `/${item}`}
                    className={`text-uppercase text-decoration-none fw-bold p-2 rounded-1 ${isMobile ? 'd-block' : 'mx-lg-1 mx-1 px-lg-4 px-3'}`}
                >
                    {item}
                </NavLink>
            </li>
        ));

    return (
        <>
            <section ref={headerRef} id="header-section" className="position-sticky top-0 z-1 shadow-sm">
                <div className="container-fluid">
                    <div className="row align-items-center p-sm-3 p-2">
                        <div className="col-sm-2 col-4 pe-lg-4 pe-2">
                            <Link onClick={closeModal} to="/">
                                <img className="logo" src="/media/logo.webp" alt="company logo" />
                            </Link>
                        </div>
                        <div className="col-sm-10 col-8 d-flex justify-content-end">
                            <ul className="m-0 p-0 d-sm-block d-none">
                                {renderLinks()}
                            </ul>
                            <div className="d-sm-none d-flex justify-content-end">
                                <img onClick={toggleModal} className="w-25" src="/media/menu.png" alt="menu icon" />
                            </div>
                        </div>
                    </div>
                    {headerModal && (
                        <div className="row d-sm-none d-block p-2">
                            <div className="col-12">
                                <ul className="m-0 p-0 link-text-mob">
                                    {renderLinks(true)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div onClick={openWhatsapp} id="chat-section" className="position-fixed z-1 d-flex justify-content-center py-lg-1 py-sm-2 py-1">
                <img src="/media/whatsapp.png" alt="whatsapp icon" />
            </div>

        </>
    );
}

export default Header;