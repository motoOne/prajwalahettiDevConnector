const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { status } = require("express/lib/response");
// @route GET api/profile/me
// @desc get current users profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      res.status(400).json({ msg: "There is no profile for the user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Seerver Error");
  }
});
// @route Post api/profile
// @desc  create or update user profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is requires").not().isEmpty(),
      check("skills", "skills is requierd").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Servver error");
    }

    console.log(profileFields.skills);
    //res.send("Hello");
  }
);
// @route get api/profile
// @desc  get all profiles
// @access public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", [
      "name",
      "avatar",
      "email  ",
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Servvver error ");
  }
});
// @route get api/profile/user/user_id
// @desc  get profile by user id
// @access public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar", "email  "]);
    if (!profile) return res.status(400).json({ msg: "profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "profile not found" });
    res.status(500).send("Servvver error ");
  }
});
// @route delete api/profile
// @desc  delete profile users and post
// @access public
router.delete("/", auth, async (req, res) => {
  try {
    //
    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // remove user
    await Profile.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Serrrver error ");
  }
});
// @route put api/profile/experience
// @desc  add profile experience
// @access private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route delete api/profile/experience
// @desc  delete profile experience
// @access private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
      
      //console.log(`${removeIndex } and ${profile.experience.length}`);
   if( removeIndex<0)
   {
     //console.log("deos not exist");
     return res.json({msg:"exp does not exist"})
   }
   
     profile.experience.splice(removeIndex,1);
     await profile.save();
     res.json(profile)
   

  } catch (err) {
    console.error(err.message);
    res.status(500).send(" server error");
  }
});


// updating a experience


// // @route post api/profile/experience
// // @desc  post profile experience
// // @access private
// router.post("/experience/:exp_id", auth, async (req, res) => {
//   const { title, company, location, from, to, current, description } =
//       req.body;
//     const updateExp = {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description,
//     };

//   try {
//     const profile = await Profile.findOne({ user: req.user.id });

//     const updatdeIndex = profile.experience
//       .map((item) => item.id)
//       .indexOf(req.params.exp_id);
      
//       if(updatdeIndex>0)
//       {
//         profile.experience={...Profile,updateExp};
//         res.json(Profile);
//       }
//       else{
//         res.json({msg:" your error"})
//       }


//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send(" server error");
//   }
// });

  
module.exports = router;
