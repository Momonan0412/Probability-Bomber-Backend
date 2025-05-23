const StaticVariable = require("../config/StaticVariable");
const CreateQuestionDTO = require("../dto/CreateQuestionDTO");
const EditQuestionDTO = require("../dto/EditQuestionDTO");
const QuestionRepository = require("../repositories/QuestionRepository");
const QuizRepository = require("../repositories/QuizRepository");
const UserRepository = require("../repositories/UserRepository");

class QuestionService {
    static async createQuestionService(createQuestionDTO, teacherUid){
        const teacherData = await UserRepository.getUserData(teacherUid, StaticVariable.teacherRole);
        if(createQuestionDTO instanceof CreateQuestionDTO){
            createQuestionDTO.setTeacherName(teacherData.name)
            await QuestionRepository.createQuestion(createQuestionDTO)
        } else {
            throw new Error(`Invalid DTO instance received in createQuestionService`);
        }       
    }

    static async editQuestionService(editQuestionDTO){
        if(editQuestionDTO instanceof EditQuestionDTO){
            await QuestionRepository.editQuestion(editQuestionDTO)
        } else {
            throw new Error(`Invalid DTO instance received in editQuestionService`);
        }  
    }

    static async addQuestionToTheQuizService(questionName, quizName){
        const questionId = await QuestionRepository.getQuestionIdByName(questionName);
        const quizId = await QuizRepository.getQuizIdByName(quizName);
        await QuizRepository.addQuestionToQuiz(questionId, quizId);
    }
    static async removeAllQuestionService(questionName){
        const snapshot = await QuizRepository.getQuizSnapshot();
        const questionId = await QuestionRepository.getQuestionIdByName(questionName);
        await Promise.all(
            snapshot.docs.map(async (doc) => {
                await QuizRepository.deleteQuestionOnQuiz(questionId, doc.id);
            })
        );
    }
    static async removeAQuestionOfAQuiz(questionName, quizName){
        const quizId = await QuizRepository.getQuizIdByName(quizName)
        const questionId = await QuestionRepository.getQuestionIdByName(questionName);
        await QuizRepository.deleteQuestionOnQuiz(questionId, quizId);
    }
    static async deleteQuestionService(questionName){
        await QuestionService.removeAllQuestionService(questionName);
        await QuestionRepository.removeQuestion(questionName);
    }
    static async getAllQuestionService() {
        const snapshot = await QuestionRepository.getQuestionSnapshot();
        const allQuestions = await Promise.all(
            snapshot.docs.map(async (doc) => doc.data())
        );
        return allQuestions;
    }
}
module.exports = QuestionService;