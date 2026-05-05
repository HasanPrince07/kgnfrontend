import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const BACKEND_URL = "https://kgnbackend.onrender.com"; 

function Home() {

    const [pageData, setPageData] = useState({
        main: { heading: "", description: "", images: [], imgIndex: 0 },
        history: [],
        product: [],
        numbers: {},
        numberList: [],
        certificate: [],
        policy: "",
        faq: []
    });
    const [openIds, setOpenIds] = useState([]);

    const divRef = useRef(null);
    const sliderRef = useRef(null);
    const headingInterval = useRef(null);

    const handleHeading = useCallback((title) => {
        if (!title) return;
        if (headingInterval.current) clearInterval(headingInterval.current);
        let index = 0;
        headingInterval.current = setInterval(() => {
            setPageData(prev => ({
                ...prev,
                main: { ...prev.main, heading: title.slice(0, index + 1) }
            }));
            index++;
            if (index >= title.length) clearInterval(headingInterval.current);
        }, 100);
    }, []);

    const handleSlider = useCallback((images) => {
        if (!images?.length) return;
        if (sliderRef.current) clearInterval(sliderRef.current);
        sliderRef.current = setInterval(() => {
            setPageData(prev => ({
                ...prev,
                main: { ...prev.main, imgIndex: (prev.main.imgIndex + 1) % images.length }
            }));
        }, 3000);
    }, []);

    const handleNumbers = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/admin/fetchnumber`);
            const resData = await res.json();
            if (res.ok) {
                const numberArr = resData.data;
                const targets = numberArr.reduce((acc, item) => {
                    acc[item.title.toLowerCase().trim()] = parseInt(item.number.replace(/\D/g, ""), 10) || 0;
                    return acc;
                }, {});
                let start = null;
                const step = (timestamp) => {
                    if (!start) start = timestamp;
                    const progress = Math.min((timestamp - start) / 2000, 1);

                    const currentNumbers = {};
                    for (const key in targets) {
                        currentNumbers[key] = Math.floor(targets[key] * progress);
                    }
                    setPageData(prev => ({ ...prev, numbers: currentNumbers, numberList: numberArr }));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        } catch (error) { console.error(error); }
    }, []);

    const handleMain = useCallback(async () => {
        const endpoints = [
            `${BASE_URL}/user/fetchmain`, `${BASE_URL}/user/fetchhistory`, `${BASE_URL}/user/fetchproduct`,
            `${BASE_URL}/user/fetchcertificate`, `${BASE_URL}/user/fetchpolicy`, `${BASE_URL}/user/fetchfaq`
        ];
        try {
            const responses = await Promise.allSettled(endpoints.map(url => fetch(url).then(r => r.json())));
            const update = {};
            responses.forEach((res, i) => {
                if (res.status === 'fulfilled' && res.value?.data) {
                    const data = res.value.data;
                    if (i === 0) {
                        update.mainData = data;
                        handleHeading(data.title);
                        handleSlider(data.images);
                    }
                    if (i === 1) update.history = data;
                    if (i === 2) update.product = data;
                    if (i === 3) update.certificate = data.images;
                    if (i === 4) update.policy = data.description;
                    if (i === 5) update.faq = data;
                }
            });
            setPageData(prev => ({
                ...prev,
                ...update,
                main: {
                    ...prev.main,
                    description: update.mainData?.description || prev.main.description,
                    images: update.mainData?.images || prev.main.images,
                }
            }));
        } catch (e) {
            console.error("Fetch error:", e);
        }
    }, [handleHeading, handleSlider]);

    useEffect(() => {
        handleMain();
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                handleNumbers();
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (divRef.current) observer.observe(divRef.current);
        return () => {
            observer.disconnect();
            if (sliderRef.current) clearInterval(sliderRef.current);
            if (headingInterval.current) clearInterval(headingInterval.current);
        };
    }, [handleMain, handleNumbers]);

    const toggleFaq = useCallback((id) => {
        setOpenIds((prev) =>
            prev.includes(id)
                ? prev.filter((openId) => openId !== id)
                : [...prev, id]
        );
    }, []);

    return (
        <>
            <main>
                <section id="banner-section" className="mb-sm-5 mb-4 pb-sm-5 pb-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12 outside-div pt-sm-3 pt-0 px-sm-4 px-0">
                                <div className="position-relative">
                                    {pageData.main.images.length > 0 ?
                                        <img key={pageData.main.imgIndex} className="w-100 object-fit-cover fade-in-image" src={`BACKEND_URL/${pageData.main.images[pageData.main.imgIndex]}`} alt="banner" fetchPriority="high" />
                                        : <div className="empty-div"></div>
                                    }
                                    <div className="d-flex align-items-center justify-content-center inside-div position-absolute top-0 bottom-0 start-0 end-0">
                                        <div className="px-lg-5 px-2">
                                            <h2 className="text-center text-uppercase fw-bold">{pageData.main.heading}</h2>
                                            <p className="text-center d-sm-block d-none">{pageData.main.description}</p>
                                            <div className="d-flex justify-content-center">
                                                <Link className="text-decoration-none custom-btn btn rounded-0 text-uppercase fw-bold px-sm-5 px-4" to="/about">
                                                    know more
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="history-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container">
                        <div className="row mb-sm-5 mb-4">
                            <div className="col-12">
                                <h2 className="text-center text-uppercase fw-bold m-0">our history</h2>
                            </div>
                        </div>
                        {pageData.history.map((dt) => (
                            <div key={dt._id} className="row mt-sm-0 mt-3">
                                <div className="col-sm-6  p-lg-5 p-sm-4 p-2 border-end border-2 d-flex align-items-center justify-content-sm-end justify-content-center">
                                    <h3 className="fw-bold m-0">{dt.year}</h3>
                                </div>
                                <div className="col-sm-6 p-lg-5 p-sm-4 p-2 border-start border-2">
                                    <p className="m-0 text-sm-start text-center">{dt.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="product-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-center text-uppercase fw-bold m-0">our products</h2>
                            </div>
                        </div>
                        <div className="row mt-0 gy-sm-5 gy-4">
                            {pageData.product.map((dt) => (
                                <div key={dt._id} className="col-sm-4 px-lg-4 px-sm-3 px-5">
                                    <Link to={`/product/${dt._id}`} className="product-card position-relative d-block">
                                        <img className="w-100 h-100 rounded-2" loading="lazy" src={dt.image} alt={dt.name} />
                                        <div role="button" className="position-absolute hover-overlay top-0 bottom-0 start-0 end-0 d-flex justify-content-center align-items-center rounded-2">
                                            <h3 className="fw-bold text-uppercase">{dt.name}</h3>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <div className="row justify-content-center mt-5">
                            <div className="col-lg-3 col-sm-5 col-10">
                                <Link to="/product" className="btn form-control see-all-btn rounded-0 fw-bold text-uppercase">
                                    see all products
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="number-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container-fluid">
                        <div ref={divRef} className="row py-md-4 py-3 gy-5">
                            {pageData.numberList.map((item) => {
                                const key = item.title.toLowerCase().trim();
                                const value = pageData.numbers[key] ?? 0;
                                return (
                                    <div key={item._id} className="col-sm-3 col-6 text-center">
                                        <h2 className="fw-bold">{value}+</h2>
                                        <p className="fw-bold text-uppercase m-0">{item.title}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section id="certificate-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-center text-uppercase fw-bold m-0">our certificates</h2>
                            </div>
                        </div>
                        <div className="row justify-content-evenly align-items-center mt-sm-5 mt-4">
                            {pageData.certificate.map((src, index) => (
                                <div key={index} className="col-lg-2 col-sm-3 col-8 py-sm-0 py-3 d-flex justify-content-center">
                                    <img className="w-100 h-100" loading="lazy" src={src} alt={`certificate ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="policy-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-uppercase fw-bold text-center">quality assurance policy</h2>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <p className="text-center m-0 px-2">{pageData.policy}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq-section" className="my-sm-5 my-4 py-sm-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-center fw-bold m-0">FAQs</h2>
                            </div>
                        </div>
                        <div className="row mt-sm-4 mt-4 px-lg-5 px-sm-2 px-3">
                            {pageData.faq.map((dt) => {
                                const isOpen = openIds.includes(dt._id);
                                return (
                                    <div key={dt._id} className={`col-12 px-0 pb-3 my-3 faq-div ${isOpen ? 'is-open' : ''}`}>
                                        <div role="button" onClick={() => toggleFaq(dt._id)} className="d-flex justify-content-between align-items-center">
                                            <h3 className="pe-2">{dt.question}</h3>
                                            <img src="media/down-arrow.png" alt="toggle" className="faq-arrow" />
                                        </div>
                                        <div className="faq-answer-wrapper">
                                            <div className="faq-answer-content">
                                                <p className="m-0">{dt.answer}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Home;
