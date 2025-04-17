const StaticVariable = require("../config/StaticVariable");
const ClassRepository = require("../repositories/ClassRepository");
const StudentRepository = require("../repositories/StudentRepository");
const UserRepository = require("./UserRepository");
class HelperRepository{
    static async studentUidAndClassData(classId, emailOrName) {
        const studentUid = await StudentRepository.findStudentUidByEmailOrUsername(emailOrName);
        const classData = await ClassRepository.getClassData(classId);
        const classRef = await ClassRepository.getClassDocument(classId); // Get doc ref
        return { studentUid, classData, classRef };
    }
    static async getAllTeacherClassDataPromise(teacherUid){
        const teacherData = await UserRepository.getUserData(teacherUid, StaticVariable.teacherRole)
        console.log("Teacher Data: ", teacherData)
        const classIds = teacherData.classes || [];
        if (classIds.length === 0) {
            return res.status(200).json({ message: "No classes found", classes: [] });
        }
        const classPromises = classIds.map(classId =>
            ClassRepository.getClassData(classId)
        );
        return Promise.all(classPromises)
    }
    static async getAllStudentsNameInClassByClassName(className){
        const classId = await ClassRepository.getClassIdByName(className)
        const classData = await ClassRepository.getClassData(classId)
        const studentUids = classData.studentUids || [];
        
        const studentPromises = studentUids.map(studentUid =>
            UserRepository.getUserData(studentUid, StaticVariable.studentRole)
        );
        const studentsPromise = await Promise.all(studentPromises)
        const studentsNames = studentsPromise.map(studentData => studentData.name
        );
        return studentsNames
    }
}
module.exports = HelperRepository;