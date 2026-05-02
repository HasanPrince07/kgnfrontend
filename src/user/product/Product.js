import { Link, useParams } from "react-router-dom";
import Wallpaper from "../../common/Wallpaper";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./Product.css";

const WALLPAPER_INITIAL_STATE = { title: "", image: "" }

function Product() {
    var { id } = useParams();

    const [product, setProduct] = useState({
        image: "",
        name: "",
        description: "",
        applications: "",
        positions: "",
        usage: [],
        chemical: [],
        mechanical: []
    });
    const [products, setProducts] = useState([]);
    const [wallpaper, setWallpaper] = useState(WALLPAPER_INITIAL_STATE);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const results = await Promise.allSettled([
                    fetch("/user/fetchproduct").then(res => res.json()),
                    fetch(`/user/fetchwallpaper/2`).then(res => res.json())
                ]);
                if (results[0].status === 'fulfilled' && results[0].value.data) {
                    setProducts(results[0].value.data);
                } else {
                    setProducts([]);
                    console.log("Error in product:", results[0].value.message);
                }
                if (results[1].status === 'fulfilled' && results[1].value.data) {
                    setWallpaper(results[1].value.data);
                } else {
                    setWallpaper(WALLPAPER_INITIAL_STATE);
                    console.log("Error in wallpaper:", results[1].value.message);
                }
            } catch (error) {
                console.log("Error during fetch product or wallpaper data:", error);
            }
        }
        fetchAll();
    }, []);

    useEffect(() => {
        const fetchCurrent = async () => {
            const url = id ? `/user/fetchproductbyid/${id}` : `/user/fetchfirstproduct`
            try {
                const res = await fetch(url);
                const resData = await res.json();
                if (!res.ok) {
                    if (res.status === 404) {
                        console.log(resData.message);
                    } else {
                        console.log(resData.message);
                    }
                } else {
                    setProduct(resData.data);
                    window.scrollTo(0, 0);
                }
            } catch (error) {
                console.log("Error during fetch product data by id:", error);
            }
        }
        fetchCurrent();
    }, [id]);

    const handleBrochure = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/user/downloadbrochure`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(product)
            });
            if (!res.ok) {
                const resData = await res.json();
                toast(resData.message, { type: "error" });
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${product.name}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast("PDF download successfully", { type: "success" });
        } catch (error) {
            console.log("Error during download brochure:", error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {wallpaper.image ? (<Wallpaper heading={wallpaper.title} imgSrc={wallpaper.image} />) : null}

            <main>
                <section id="product-name-section" className="my-lg-5 my-4 py-lg-5 py-4">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-sm-6 px-lg-5 px-4">
                                <img className="rounded-2" src={`/${product?.image}`} alt={product?.name} />
                            </div>
                            <div className="col-sm-6 px-lg-5 px-4">
                                <h3 className="fw-bold text-uppercase mt-sm-0 mt-4">{product?.name}</h3>
                                <p>{product?.description}</p>
                                <div className="col-6">
                                    <button onClick={handleBrochure} disabled={loading} className="btn text-uppercase fw-bold rounded-0 form-control">{loading ? <><div className="spinner mx-auto"></div></> : "download brochure"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="product-detail-section" className="mx-sm-0 mx-3">
                    <div className="container">
                        <DetailBox title="Applications" data={product?.applications} />
                        <DetailBox title="Welding positions" data={product?.positions} />
                        <div className="row my-sm-5 my-4">
                            {product?.usage.length > 0 && (
                                <div className="col-12 p-4">
                                    <h4>Notes on usage</h4>
                                    <ul className="m-0">
                                        {product?.usage.map((dt, index) => (
                                            <li key={index}>{dt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <TableSection title="Chemical composition" headers={["C", "Mn", "Si", "S", "P"]} data={product?.chemical} />
                        <TableSection title="Mechanical properties" headers={["U.T.S.(N/mm²)", "Y.S.(N/mm²)", "ELONGATION ( L = 4d ) %", "IMPACT ( CVN ) AT – 30° C ( J )"]} data={product?.mechanical} />
                    </div>
                </section>

                <section id="all-product-section" className="my-lg-5 my-4 py-lg-5 py-4 mx-sm-0 mx-1">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <h5 className="text-uppercase fw-bold text-center m-0">see all products</h5>
                            </div>
                        </div>
                        <div className="row mt-0 gy-lg-5 gy-4">
                            {products.map((dt) => (
                                <div key={dt._id} className="col-sm-4">
                                    <div className={`product-div p-4 ${dt._id === id ? "active-product-div" : ""}`}>
                                        <h4 className="text-uppercase">{dt.name}</h4>
                                        <Link to={`/product/${dt._id}`} className="btn text-uppercase fw-bold rounded-0 mt-3">know more</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

const TableSection = ({ title, headers, data }) => {
    if (!data || data.length === 0) return null
    return (
        <div className="row my-sm-5 my-4">
            <div className="col-12 p-4">
                <h4>{title} of Weld Steel</h4>
                <div className="table-responsive">
                    <table className="table table-bordered align-middle text-center mt-3 mb-0">
                        <thead>
                            <tr className="align-middle">
                                {headers.map((text, i) => (
                                    <th key={i}>{text}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {data.map((val, i) => (
                                    <td key={i}>{val}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const DetailBox = ({ title, data }) => {
    return (
        <div className="row my-sm-5 my-4">
            <div className="col-12 p-4">
                <h4>{title}</h4>
                <p className="m-0">{data}</p>
            </div>
        </div>
    );
}

export default Product;