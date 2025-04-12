const FirebaseService = require("../config/FirebaseService");
const ClassModel = require("../models/Class/ClassModel");
const ClassRepository = require("../repositories/ClassRepository");
const StudentRepository = require("../repositories/StudentRepository");
const TeacherRepository = require("../repositories/TeacherRepository");
class TeacherController {
    static async createClass(req, res){
        try {
            const { className } = req.body;
            console.log("Teacher ID: ", req.uid)
            const classId = await ClassRepository.createClass(className, req.uid)
            TeacherRepository.addClass(classId, req.uid)
            res.status(200).json({ message: "Success!"});
        } catch (error) {
            console.error("Error creating class:", error);
            res.status(500).json({ error: "Failed to create class." });
        }
    }

    static async studentUidAndClassData(classId, emailOrName) {
        const studentUid = await StudentRepository.findStudentUidByEmailOrUsername(emailOrName);
        const classData = await ClassRepository.getClassData(classId);
        const classRef = await ClassRepository.getClassDocument(classId); // Get doc ref
        return { studentUid, classData, classRef };
    }

    static async addStudentToClass(req, res) {
        try {
            const { classId, emailOrName } = req.body;
            const { studentUid, classData, classRef } = await TeacherController.studentUidAndClassData(classId, emailOrName);
    
            const studentUids = classData.studentUids || [];

            if (!studentUids.includes(studentUid)) {
                studentUids.push(studentUid);
                await classRef.update({ studentUids });
            }

            res.status(200).json({ message: "Student added to class." });
        } catch (error) {
            console.error("Error adding student:", error);
            res.status(500).json({ error: "Failed to add student." });
        }
    }

    static async removeStudentFromClass(req, res) {
        try {
            const { classId, emailOrName } = req.body;
            const { studentUid, classData, classRef } = await TeacherController.studentUidAndClassData(classId, emailOrName);
    
            const updatedUids = (classData.studentUids || []).filter(uid => uid !== studentUid);
            await classRef.update({ studentUids: updatedUids });

            res.status(200).json({ message: "Student removed from class." });
        } catch (error) {
            console.error("Error removing student:", error);
            res.status(500).json({ error: "Failed to remove student." });
        }
    }

}

module.exports = TeacherController;