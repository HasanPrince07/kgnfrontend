import { useCallback, useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import { toast } from "react-toastify";

function Policy() {
    const [editModal, setEditModal] = useState(false);
    const [description, setDescription] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState({
        table: false,
        form: false
    });
    const [error, setError] = useState(false);

    const handleFetch = useCallback(async () => {
        setLoading(prev => ({ ...prev, table: true }));
        try {
            const res = await fetch(`/admin/fetchpolicy`,{
                credentials: "include"
            });
            const resData = await res.json();
            if (!res.ok) {
                if (res.status === 404) {
                    setData(null);
                    console.warn(resData.message);
                } else {
                    toast(resData.message, { type: "error" });
                }
            } else {
                setData(resData.data);
            }
        } catch (error) {
            toast("Network error, please check your internet", { type: "error" });
            console.log("Error during fetch policy data:", error);
        } finally {
            setLoading(prev => ({ ...prev, table: false }));
        }
    }, []);

    useEffect(() => {
        handleFetch();
    }, [handleFetch]);

    const handleForm = async (e) => {
        e.preventDefault();
        const formdata = { description };
        if (!description.trim()) {
            setError(true);
            return
        } else {
            setLoading(prev => ({ ...prev, form: true }));
            try {
                const res = await fetch(`/admin/updatepolicy/${data?._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(formdata)
                });
                const resData = await res.json();
                if (!res.ok) {
                    toast(resData.message, { type: "error" });
                } else {
                    setData(resData.data);
                    setError(false);
                    setEditModal(false);
                    toast(resData.message, { type: "success" });
                }
            } catch (error) {
                toast("Network error, please check your internet", { type: "error" });
                console.log("Error during update policy data:", error);
            } finally {
                setLoading(prev => ({ ...prev, form: false }));
            }
        }
    }

    const handleModal = (modal) => {
        if (modal === true) {
            setDescription(data.description);
            setEditModal(true);
        } else {
            setError(false);
            setEditModal(false);
        }
    }

    return (
        <>
            <main id="admin-section">
                <div className="container-fluid">
                    <div className="row">
                        <Sidebar />
                        <div className="col-sm-9 col-12 admin-div">
                            <h2 className="fw-bold text-center text-uppercase my-4">policy management page</h2>
                            <div className="table-responsive">
                                <table className="table text-center table-bordered align-middle">
                                    <thead className="align-middle text-uppercase">
                                        <tr>
                                            <th>s.no.</th>
                                            <th>description</th>
                                            <th>action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading.table ?
                                            <tr>
                                                <td colSpan={3} className="py-2"><div className="spinner mx-auto"></div></td>
                                            </tr>
                                            :
                                            data ?
                                                <tr key={data._id}>
                                                    <td>1</td>
                                                    <td>{data.description}</td>
                                                    <td><button onClick={() => handleModal(true)} className="btn fw-bold text-uppercase rounded-0 px-4">edit</button></td>
                                                </tr>
                                                :
                                                <tr>
                                                    <td colSpan={3} className="text-uppercase">no data</td>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {editModal &&
                <section id="edit-modal-section" className="position-fixed top-0 bottom-0 start-0 end-0 z-1 d-flex align-items-center">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6 col-12 edit-modal-div position-relative py-sm-5 py-4 px-sm-5 px-4">
                                <img role="button" onClick={() => handleModal(false)} className="position-absolute" src="media/close.png" alt="close icon" />
                                <h3 className="text-center text-uppercase fw-bold mb-sm-4 mb-3">update policy section</h3>
                                <div className="modal-body px-3">
                                    <form onSubmit={handleForm}>
                                        <label className="mb-1">Description</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`form-control rounded-0 shadow-none ${error && !description.trim() ? "error-input" : ""}`}></textarea>
                                        <p className="my-1">{error && description.trim().length === 0 ? "Description is required" : ""}</p>
                                        <div className="d-flex mt-sm-2 mt-2">
                                            <button type="submit" disabled={loading.form} className="btn text-uppercase fw-bold shadow-none form-control rounded-0">{loading.form ? <><div className="spinner mx-auto"></div></> : "update"}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            }
        </>
    );
}

export default Policy;