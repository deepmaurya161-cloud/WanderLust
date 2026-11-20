const Listing = require("../models/listing");
const getCoordinates = require("../utills/geocode");

// Index Route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// New Form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show Route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Create Route
module.exports.createListing = async (req, res) => {

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // 🔥 STEP 1: GET COORDINATES
    const coords = await getCoordinates(
        `${newListing.location}, ${newListing.country}`
    );

    console.log("COORDS:", coords);

    // 🔥 STEP 2: VALIDATION
    if (!coords) {
        req.flash("error", "Location not found!");
        return res.redirect("/listings/new");
    }

    // 🔥 STEP 3: SAVE GEOMETRY (IMPORTANT)
    newListing.geometry = {
        lat: coords.lat,
        lon: coords.lon
    };

    console.log("Coords:", coords);
    console.log("Geometry before save:", newListing.geometry);

    // 🔥 STEP 4: SAVE TO DB
    await newListing.save();
    console.log("Saved listing:", newListing.geometry);

    req.flash("success", "New Listing created!");
    res.redirect("/listings");
};

// Edit Form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    let originalImage = listing.image.url;
    originalImage = originalImage.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,originalImage });
};

// Update Route
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {
        ...req.body.listing,
    });

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image= {url,filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// Delete Route
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};