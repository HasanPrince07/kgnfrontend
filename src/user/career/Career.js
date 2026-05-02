import { useEffect, useState } from "react";
import Wallpaper from "../../common/Wallpaper";
import { Link } from "react-router-dom";
import "./Career.css";

const WALLPAPER_INITIAL_STATE = { title: "", image: "" }

function Career() {

    const [career, setCareer] = useState([]);
    const [wallpaper, setWallpaper] = useState(WALLPAPER_INITIAL_STATE);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const results = await Promise.allSettled([
                    fetch("/user/fetchcareer").then(res => res.json()),
                    fetch(`/user/fetchwallpaper/3`).then(res => res.json())
                ]);
                if (results[0].status === 'fulfilled' && results[0].value.data) {
                    setCareer(results[0].value.data);
                } else {
                    setCareer([]);
                    console.log("Error in career:", results[0].value.message);
                }
                if (results[1].status === 'fulfilled' && results[1].value.data) {
                    setWallpaper(results[1].value.data);
                } else {
                    setWallpaper(WALLPAPER_INITIAL_STATE);
                    console.log("Error in wallpaper:", results[1].value.message);
                }
            } catch (error) {
                console.log("Error during fetch career or wallpaper data:", error);
            }
        }
        fetchAll();
    }, []);

    const hasJobs = career.length > 0

    return (
        <>
            {wallpaper.image ? (<Wallpaper heading={wallpaper.title} imgSrc={wallpaper.image} />) : null}

            <main>
                <section id="career-form-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h2 className="text-uppercase text-center fw-bold m-0"> {hasJobs ? " job openings" : "no job opening for now"}</h2>
                            </div>
                        </div>
                        <div className="row mt-lg-5 mt-4">
                            <div className="col-12">
                                <div className="table-responsive">
                                    {hasJobs && (
                                        <table className="table table-bordered text-center align-middle">
                                            <thead>
                                                <tr className="text-uppercase align-middle">
                                                    <th>s.no.</th>
                                                    <th>job title</th>
                                                    <th>action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {career.map((dt, index) => (
                                                    <tr key={dt._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{dt.title}</td>
                                                        <td><Link to={`/career_detail/${dt._id}`} className="btn career-form-btn text-uppercase fw-bold rounded-0 px-sm-4">more details</Link></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

export default Career;