// router.get('/nearby', async (req, res) => {
//   const { lng, lat } = req.query; // Passed from LocationScreen
  
//   try {
//     const pros = await User.find({
//       role: 'technician',
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
//           $maxDistance: 10000 // 10km radius
//         }
//       }
//     });
//     res.json(pros);
//   } catch (err) {
//     res.status(500).json({ error: "Could not find technicians" });
//   }
// });