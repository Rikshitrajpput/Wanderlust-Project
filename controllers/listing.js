const Listing = require("../models/listing.js");
// GET all listings

module.exports.index =  async (req, res)=> {
  const listings= await Listing.find({});
  res.render("listings/index", { listings });
  
};

module.exports.renderNewForm =  (req, res)=> {
  res.render("listings/new");
};

module.exports.createNewListing = async (req, res,next) => {
  //  listingSchema.validate(req.body);
    const data = req.body.listing;
    if (data.image && data.image.url === "") {
        delete data.image.url;
    }
    const newListing = new Listing(data);
    newListing.Owner = req.user._id;
    if (req.file) {
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename
    };
  }
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
};

module.exports.showListing = async (req, res)=> {
  const listing= await Listing.findById(req.params.id)
  .populate({
    "path": "reviews", 
    "populate": {
      "path": "author"
    }})
  .populate("Owner");
  if(!listing){
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.renderEditForm = async (req, res)=> {
  const listing= await Listing.findById(req.params.id);
  if(!listing){
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl.replace("/uploads/", "/uploads/h_300,w_250");
  res.render("listings/edit", { listing });
};

module.exports.updateListing = async (req, res, next) => {
        if (!req.body.listing) {
            throw new ExpressError(400, "Send valid data for listing");
        }
         const { id } = req.params;
         const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { returnDocument: "after", runValidators: true }
        );
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            updatedListing.image = {url,filename};
            await updatedListing.save();
        }
        req.flash("success", "Listing updated successfully!");
        res.redirect(`/listings/${updatedListing._id}`);
    };

    module.exports.deleteListing = async (req, res)=> {
  const { id }= req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
};