import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const QUICK_LINKS = ["Home", "About", "Product", "Career", "Contact"];

function Footer() {

    const [contact, setContact] = useState({});
    const [product, setProduct] = useState([]);

    const PRODUCTS = useMemo(() => {
        if (!product || product.length === 0) return [];
        return product.map(item => ({ id: item._id, name: item.name }));
    }, [product]);

    const handleFetch = useCallback(async () => {
        const endpoints = [
            { url: `${BASE_URL}/user/fetchcontact`, setter: setContact },
            { url: `${BASE_URL}/user/fetchproduct`, setter: setProduct }
        ];
        try {
            const results = await Promise.allSettled(
                endpoints.map(api => fetch(api.url).then(res => {
                    if (!res.ok) console.log(`Failed to fetch ${api.url}`);
                    return res.json();
                }))
            );
            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    endpoints[index].setter(result.value.data);
                } else {
                    console.log(`Error in ${endpoints[index].url}:`, result.reason);
                }
            });
        } catch (error) {
            console.log("Error during fetch contact or product data:", error);
        }
    }, [setContact, setProduct]);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const ContactRow = ({ src, alt, text }) => (
        <div className="row py-1">
            <div className="col-lg-2 col-12"><img className="contact-img" src={`${BASE_URL}/${src}`} alt={alt} /></div>
            <div className="col-lg-10 col-12 contact-text pt-sm-0 pt-1">{text}</div>
        </div>
    );

    return (
        <>
            <section id="footer-section">
                <div className="container-fluid">
                    <div className="row p-lg-5 p-4">
                        <div className="col-sm-3 px-lg-2 px-0">
                            <Link to="/">
                                <img className="logo h-auto" src="/media/logo.webp" alt="comapany logo" />
                            </Link>
                        </div>
                        <div className="col-sm-3 px-lg-2 px-0 mt-sm-0 mt-3">
                            <h3 className="text-uppercase fw-bold mb-sm-3 mb-1">links</h3>
                            <ul className="p-0">
                                {QUICK_LINKS.map(link => (
                                    <li key={link} className="d-block py-1">
                                        <Link to={link === "Home" ? "/" : `/${link.toLowerCase()}`} className="text-decoration-none footer-links">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-sm-3 px-lg-2 px-0">
                            <h3 className="text-uppercase fw-bold mb-sm-3 mb-1">products</h3>
                            <ul className="p-0">
                                {PRODUCTS.map(item => (
                                    <li key={item.id} className="d-block py-1"><Link to={`/product/${item.id}`} className="text-decoration-none footer-links">{item.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-sm-3 px-lg-2 px-0">
                            <h3 className="text-uppercase fw-bold mb-sm-3 mb-1">contact</h3>
                            <ContactRow src="/media/call.png" alt="call icon" text={contact?.phone} />
                            <ContactRow src="/media/email.png" alt="email icon" text={contact?.email} />
                            <ContactRow src="/media/location.png" alt="address icon" text={contact?.address} />
                            <div className="row mt-3">
                                <div className="col-12">
                                    <ul className="p-0 m-0 social-media">
                                        <li className="d-inline-block">
                                            <Link to={contact?.linkedin} target="_blank" className="d-inline-block me-4"><img src="/media/linkedin.png" alt="linkedin icon" /></Link>
                                        </li>
                                        <li className="d-inline-block">
                                            <Link to={contact?.facebook} target="_blank" className="d-inline-block"><img src="/media/facebook.png" alt="facebook icon" /></Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <p className="my-2 text-center">{contact?.footer}</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Footer;
