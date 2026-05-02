import { useCallback, useEffect, useState } from "react";
import Wallpaper from "../../common/Wallpaper";
import "./About.css";

const ABOUT_INITIAL_STATE = { title: "", description: "", company: "", vision: "", features: [], chooseus: [], images: [] }
const WALLPAPER_INITIAL_STATE = { title: "", image: "" }

function About() {
    const [about, setAbout] = useState(ABOUT_INITIAL_STATE);
    const [wallpaper, setWallpaper] = useState(WALLPAPER_INITIAL_STATE);

    const handleAbout = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                fetch("/user/fetchabout").then(res => res.json()),
                fetch(`/user/fetchwallpaper/1`).then(res => res.json())
            ]);
            if (results[0].status === 'fulfilled' && results[0].value.data) {
                setAbout(results[0].value.data);
            } else {
                setAbout(ABOUT_INITIAL_STATE);
                console.log("Error in about:", results[0].value.message);
            }
            if (results[1].status === 'fulfilled' && results[1].value.data) {
                setWallpaper(results[1].value.data);
            } else {
                setWallpaper(WALLPAPER_INITIAL_STATE);
                console.log("Error in wallpaper:", results[1].value.message);
            }
        } catch (error) {
            console.log("Error during fetch about or wallpaper data:", error);
        }
    }, []);

    useEffect(() => {
        handleAbout();
    }, [handleAbout]);

    return (
        <>
            {wallpaper.image ? (<Wallpaper heading={wallpaper.title} imgSrc={wallpaper.image} />) : null}

            <main>
                <section id="owner-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-sm-6 px-lg-5 px-4">
                                <img className="w-100 h-100 rounded-2" src={about.images?.[0] || `media/user.png`} alt="owner" />
                            </div>
                            <div className="col-sm-6 px-lg-5 px-4">
                                <h3 className="fw-bold text-uppercase mt-sm-0 mt-4">{about.title}</h3>
                                <p className="mb-0">{about.description}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="points-section">
                    <div className="container-fluid">
                        <div className="row px-lg-5 px-4">
                            <div className="col-12">
                                <h3 className="fw-bold text-uppercase">our company</h3>
                                <p>{about.company}</p>
                            </div>
                            <div className="col-12 mt-3">
                                <h3 className="fw-bold text-uppercase">our vision</h3>
                                <p>{about.vision}</p>
                            </div>
                            <div className="col-12 mt-3">
                                <h3 className="fw-bold text-uppercase">our features</h3>
                                <ul className="ps-4">
                                    {about.features?.map((dt, index) => (
                                        <li key={index} className="py-1">{dt}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="col-12 mt-3">
                                <h3 className="fw-bold text-uppercase">why choose us</h3>
                                <ul className="ps-4 m-0">
                                    {about.chooseus?.map((dt, index) => (
                                        <li key={index} className="py-1">{dt}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="gallery-section" className="my-lg-5 my-4 py-lg-5 py-4 mx-sm-0 mx-3">
                    <div className="container">
                        <div className="row">
                            <div className="col-sm-6 col-12">
                                <div className="row">
                                    <div className="col-12 p-2">
                                        <img className="w-100 h-100 rounded-2 object-fit-cover" src={about.images?.[1]} alt="gallery 1" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-6 col-12 p-2">
                                        <img className="w-100 h-100 rounded-2 object-fit-cover" src={about.images?.[2]} alt="gallery 2" />
                                    </div>
                                    <div className="col-sm-6 col-12 p-2">
                                        <img className="w-100 h-100 rounded-2 object-fit-cover" src={about.images?.[3]} alt="gallery 3" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-12 p-2">
                                <img className="w-100 h-100 h-100 rounded-2 object-fit-cover" src={about.images?.[4]} alt="gallery 4" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default About;