function Wallpaper({ heading, imgSrc }) {
    return (
        <>
            <section id="wall-section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 outer-div px-sm-3 px-2 pt-sm-3 pt-2 position-relative">
                            <img className="w-100 h-100 object-fit-cover rounded-2" src={imgSrc} alt="not-found" fetchPriority="high" />
                            <div className="inner-div position-absolute top-0 bottom-0 start-0 end-0 d-flex align-items-center mx-sm-3 mx-2 mt-sm-3 mt-2 rounded-2">
                                <h2 className="fw-bold text-uppercase m-0 px-sm-5 px-3">{heading}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Wallpaper;
