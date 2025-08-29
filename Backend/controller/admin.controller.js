import User from "../model/user.js";

// 📌 GET ALL MANAGERS PANEL
export const GetPanel = async (req, res) => {
    try {
        const ManagerPanel = await User.find({ role: "manager" });
        console.log(ManagerPanel);
        
        if (ManagerPanel.length === 0) {
            return res.status(404).json({ success: false, message: "No managers found." });
        }

        return res.status(200).json({ success: true, message: "Here are the managers", data: ManagerPanel });
    } 
    catch (err) {
        console.error(`❌ Error in GetPanel: ${err}`);
        return res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
    }
};

// 📌 APPROVE MANAGER
export const ApproveManager = async (req, res) => {
    try {
        const { email } = req.body;

        // 🔹 Check if manager exists
        const ManagerApprove = await User.findOne({ email });
        if (!ManagerApprove) {
            return res.status(404).json({ success: false, message: "Manager not found!" });
        }

        // 🔹 Check if already approved
        if (ManagerApprove.isApproved) {
            return res.status(400).json({ success: false, message: "Manager is already approved!" });
        }

        // 🔹 Approve and Save
        ManagerApprove.isApproved = true;
        await ManagerApprove.save();

        return res.status(200).json({ success: true, message: "Manager approved successfully!" });
    } 
    catch (err) {
        console.error(`❌ Error in ApproveManager: ${err}`);
        return res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
    }
};

// 📌 DELETE USER
export const DeleteUser = async (req, res) => {
    try {
        const { email } = req.body;

        // 🔹 Check if user exists before deleting
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // 🔹 Delete user
        await User.findOneAndDelete({ email });

        return res.status(200).json({ success: true, message: "User deleted successfully!" });
    } 
    catch (err) {
        console.error(`❌ Error in DeleteUser: ${err}`);
        return res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
    }
};
