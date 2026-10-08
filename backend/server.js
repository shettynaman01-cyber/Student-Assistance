
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { GoogleGenAI } = require('@google/genai')

const app = express()

const PORT = 5000

app.use(cors())
app.use(express.json())


// ================================
// GEMINI AI SETUP
// ================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})


// ================================
// FILE UPLOAD SETUP
// ================================

const uploadDirectory = path.join(
  __dirname,
  'uploads',
  'assignments'
)

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true
    }
  )
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadDirectory)
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname).toLowerCase()

    const uniqueName =
      `assignment_${Date.now()}_${Math.round(Math.random() * 100000)}${extension}`

    cb(null, uniqueName)
  }
})

const upload = multer({

  storage: storage,

  fileFilter: (req, file, cb) => {

    const extension =
      path.extname(file.originalname).toLowerCase()

    const mimeType =
      file.mimetype === 'application/pdf'

    if (
      extension === '.pdf' &&
      mimeType
    ) {
      cb(null, true)
    } else {
      cb(
        new Error('Only PDF files are allowed.')
      )
    }
  },

  limits: {
    fileSize: 10 * 1024 * 1024
  }

})


// ================================
// AI PDF UPLOAD SETUP
// ================================

const aiUploadDirectory = path.join(
  __dirname,
  'uploads',
  'ai'
)

if (!fs.existsSync(aiUploadDirectory)) {
  fs.mkdirSync(
    aiUploadDirectory,
    {
      recursive: true
    }
  )
}

const aiStorage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, aiUploadDirectory)
  },

  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname).toLowerCase()

    const uniqueName =
      `ai_${Date.now()}_${Math.round(Math.random() * 100000)}${extension}`

    cb(null, uniqueName)
  }
})

const aiUpload = multer({

  storage: aiStorage,

  fileFilter: (req, file, cb) => {

    const extension =
      path.extname(file.originalname).toLowerCase()

    const mimeType =
      file.mimetype === 'application/pdf'

    if (
      extension === '.pdf' &&
      mimeType
    ) {
      cb(null, true)
    } else {
      cb(
        new Error('Only PDF files are allowed.')
      )
    }
  },

  limits: {
    fileSize: 10 * 1024 * 1024
  }

})


// ================================
// SERVE UPLOADED FILES
// ================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
)


// ================================
// DATABASE
// ================================

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'student_assistance'
})

db.connect((error) => {
  if (error) {
    console.log(
      'MySQL connection failed:',
      error.message
    )
  } else {
    console.log(
      'MySQL connected successfully!'
    )
  }
})


// ================================
// HOME
// ================================

app.get('/', (req, res) => {
  res.send(
    'Student Assistance Backend is running!'
  )
})


// ================================
// TEST API
// ================================

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend API is working!'
  })
})


// ================================
// AI TEXT TEST
// ================================

app.get('/api/ai/test', async (req, res) => {

  try {

    const result =
      await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents:
          'Say hello in one short sentence.'
      })

    res.json({
      success: true,
      response: result.text
    })

  } catch (error) {

    console.error(
      'Gemini test failed:',
      error.message
    )

    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})


// ================================
// TEMPORARY GEMINI PDF TEST
// ================================

app.post(
  '/api/ai/test-pdf',
  aiUpload.single('pdf'),
  async (req, res) => {

    if (!req.file) {

      return res.status(400).json({
        success: false,
        message:
          'Please select a PDF file.'
      })
    }

    try {

      console.log(
        'TEST: Uploading PDF to Gemini:',
        req.file.originalname
      )

      const uploadedFile =
        await ai.files.upload({
          file: req.file.path,
          config: {
            mimeType: 'application/pdf'
          }
        })

      console.log(
        'TEST: PDF uploaded successfully.'
      )

      console.log(
        'TEST: Waiting 5 seconds...'
      )

      await new Promise(
        resolve =>
          setTimeout(resolve, 5000)
      )

      console.log(
        'TEST: Sending PDF to Gemini...'
      )

      const result =
        await ai.models.generateContent({
          model: 'gemini-3.5-flash-lite',

          contents: [
            {
              role: 'user',

              parts: [

                {
                  text:
                    'Read this PDF and tell me its title or main topic in one short sentence.'
                },

                {
                  fileData: {
                    fileUri:
                      uploadedFile.uri,

                    mimeType:
                      uploadedFile.mimeType
                  }
                }

              ]
            }
          ]
        })

      console.log(
        'TEST: Gemini PDF response received.'
      )

      fs.unlink(
        req.file.path,
        () => { }
      )

      res.json({
        success: true,
        response: result.text
      })

    } catch (error) {

      console.log(
        'TEST: Gemini PDF failed:',
        error.message
      )

      fs.unlink(
        req.file.path,
        () => { }
      )

      res.status(500).json({
        success: false,
        error: error.message
      })
    }
  }
)


// ================================
// AI PDF SUMMARY
// ================================

app.post(
  '/api/ai/summarize-pdf',
  aiUpload.single('pdf'),
  async (req, res) => {

    if (!req.file) {

      return res.status(400).json({
        message:
          'Please select a PDF file.'
      })
    }

    if (!process.env.GEMINI_API_KEY) {

      fs.unlink(
        req.file.path,
        () => { }
      )

      return res.status(500).json({
        message:
          'Gemini API key is not configured.'
      })
    }

    try {

      console.log(
        'Uploading PDF to Gemini:',
        req.file.originalname
      )

      const uploadedFile =
        await ai.files.upload({
          file: req.file.path,
          config: {
            mimeType: 'application/pdf'
          }
        })

      console.log(
        'PDF uploaded to Gemini successfully.'
      )

      console.log(
        'Waiting for Gemini to process the PDF...'
      )

      await new Promise(
        resolve =>
          setTimeout(resolve, 5000)
      )

      console.log(
        'PDF processing wait completed.'
      )

      const prompt = `
You are an AI study assistant for college students.

Read the uploaded PDF carefully and explain its content in very simple,
easy-to-understand language.

Create the response using exactly these sections:

1. Simple Summary
Explain the main topic in simple language.

2. Important Points
List the most important points the student should remember.

3. Key Concepts
Explain the important concepts and terms in easy language.

4. Possible Exam Questions
Give useful questions that could be asked in an exam based only on the PDF.

5. Quick Revision
Give a short revision section that a student can read quickly before an exam.

Important instructions:
- Use simple English.
- Avoid unnecessary technical language.
- Explain difficult concepts clearly.
- Use bullet points where appropriate.
- Do not add information that is unrelated to the PDF.
- Focus on helping a college student understand and revise the material.
`

      const result =
        await ai.models.generateContent({
          model: 'gemini-3.7-flash',

          contents: [
            {
              role: 'user',

              parts: [

                {
                  text: prompt
                },

                {
                  fileData: {
                    fileUri:
                      uploadedFile.uri,

                    mimeType:
                      uploadedFile.mimeType
                  }
                }

              ]
            }
          ]
        })

      const summary =
        result.text

      fs.unlink(
        req.file.path,
        () => { }
      )

      res.json({
        message:
          'PDF summarized successfully!',

        fileName:
          req.file.originalname,

        summary:
          summary
      })

    } catch (error) {

      console.log(
        'Gemini PDF summary failed:',
        error.message
      )

      fs.unlink(
        req.file.path,
        () => { }
      )

      res.status(500).json({
        message:
          'Unable to summarize the PDF.',

        error:
          error.message
      })
    }
  }
)


// ================================
// REGISTER
// ================================

app.post('/api/register', (req, res) => {

  const {
    name,
    email,
    password,
    role
  } = req.body

  if (!name || !email || !password) {

    return res.status(400).json({
      message:
        'All fields are required.'
    })
  }

  const userRole =
    role || 'student'

  const checkSql = `
    SELECT *
    FROM users
    WHERE email = ?
  `

  db.query(
    checkSql,
    [email],
    (error, results) => {

      if (error) {

        console.log(
          'Registration check failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Registration failed.'
        })
      }

      if (results.length > 0) {

        return res.status(400).json({
          message:
            'Email already registered.'
        })
      }

      const insertSql = `
        INSERT INTO users
        (name, email, password, role)
        VALUES (?, ?, ?, ?)
      `

      db.query(
        insertSql,
        [
          name,
          email,
          password,
          userRole
        ],
        (error, result) => {

          if (error) {

            console.log(
              'Registration failed:',
              error.message
            )

            return res.status(500).json({
              message:
                'Registration failed.'
            })
          }

          res.json({
            message:
              'Account created successfully!',

            userId:
              result.insertId
          })
        }
      )
    }
  )
})


// ================================
// LOGIN
// ================================

app.post('/api/login', (req, res) => {

  const {
    email,
    password
  } = req.body

  if (!email || !password) {

    return res.status(400).json({
      message:
        'Email and password are required.'
    })
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      role
    FROM users
    WHERE email = ?
      AND password = ?
  `

  db.query(
    sql,
    [
      email,
      password
    ],
    (error, results) => {

      if (error) {

        console.log(
          'Login failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Login failed.'
        })
      }

      if (results.length === 0) {

        return res.status(401).json({
          message:
            'Invalid email or password.'
        })
      }

      const user =
        results[0]

      res.json({
        message:
          'Login successful!',

        userId:
          user.id,

        name:
          user.name,

        role:
          user.role
      })
    }
  )
})


// ================================
// PROFILE
// ================================

app.get('/api/profile', (req, res) => {

  const userId =
    req.query.userId

  if (!userId) {

    return res.status(400).json({
      message:
        'User ID is required.'
    })
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      role
    FROM users
    WHERE id = ?
  `

  db.query(
    sql,
    [userId],
    (error, results) => {

      if (error) {

        console.log(
          'Profile fetch failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Unable to get profile.'
        })
      }

      if (results.length === 0) {

        return res.status(404).json({
          message:
            'User not found.'
        })
      }

      res.json(
        results[0]
      )
    }
  )
})


// ================================
// CREATE ASSIGNMENT
// ================================

app.post('/api/assignments', (req, res) => {

  const {
    userId,
    title,
    subject,
    dueDate,
    priority,
    description,
    classroomId,
    createdBy
  } = req.body

  if (!userId || !title) {

    return res.status(400).json({
      message:
        'User ID and title are required.'
    })
  }

  const sql = `
    INSERT INTO assignments
    (
      user_id,
      title,
      subject,
      due_date,
      priority,
      description,
      classroom_id,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `

  db.query(
    sql,
    [
      userId,
      title,
      subject,
      dueDate,
      priority,
      description,
      classroomId || null,
      createdBy || null
    ],
    (error, result) => {

      if (error) {

        console.log(
          'Assignment creation failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Assignment could not be created.'
        })
      }

      res.json({
        message:
          'Assignment created successfully!',

        assignmentId:
          result.insertId
      })
    }
  )
})


// ================================
// GET ASSIGNMENTS
// ================================

app.get('/api/assignments', (req, res) => {

  const userId =
    req.query.userId

  if (!userId) {

    return res.status(400).json({
      message:
        'User ID is required.'
    })
  }

  const sql = `
    SELECT
      id,
      title,
      subject,
      DATE_FORMAT(due_date, '%Y-%m-%d') AS dueDate,
      priority,
      description,
      completed,
      classroom_id,
      created_by
    FROM assignments
    WHERE user_id = ?
    ORDER BY due_date ASC
  `

  db.query(
    sql,
    [userId],
    (error, results) => {

      if (error) {

        console.log(
          'Assignments fetch failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Unable to get assignments.'
        })
      }

      res.json(results)
    }
  )
})


// ================================
// GET SINGLE ASSIGNMENT
// ================================

app.get(
  '/api/assignments/:id',
  (req, res) => {

    const assignmentId =
      req.params.id

    const sql = `
      SELECT
        id,
        title,
        subject,
        DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
        priority,
        description,
        completed,
        classroom_id,
        created_by
      FROM assignments
      WHERE id = ?
    `

    db.query(
      sql,
      [assignmentId],
      (error, results) => {

        if (error) {

          console.log(
            'Assignment details fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get assignment details.'
          })
        }

        if (results.length === 0) {

          return res.status(404).json({
            message:
              'Assignment not found.'
          })
        }

        res.json(
          results[0]
        )
      }
    )
  }
)


// ================================
// UPDATE ASSIGNMENT
// ================================

app.put(
  '/api/assignments/:id',
  (req, res) => {

    const assignmentId =
      req.params.id

    const {
      title,
      subject,
      dueDate,
      priority,
      description
    } = req.body

    const sql = `
      UPDATE assignments
      SET
        title = ?,
        subject = ?,
        due_date = ?,
        priority = ?,
        description = ?
      WHERE id = ?
    `

    db.query(
      sql,
      [
        title,
        subject,
        dueDate,
        priority,
        description,
        assignmentId
      ],
      (error) => {

        if (error) {

          console.log(
            'Assignment update failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Assignment could not be updated.'
          })
        }

        res.json({
          message:
            'Assignment updated successfully!'
        })
      }
    )
  }
)


// ================================
// UPDATE ASSIGNMENT STATUS
// ================================

app.put(
  '/api/assignments/:id/status',
  (req, res) => {

    const assignmentId =
      req.params.id

    const {
      completed
    } = req.body

    const sql = `
      UPDATE assignments
      SET completed = ?
      WHERE id = ?
    `

    db.query(
      sql,
      [
        completed ? 1 : 0,
        assignmentId
      ],
      (error) => {

        if (error) {

          console.log(
            'Assignment status update failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Assignment status could not be updated.'
          })
        }

        res.json({
          message:
            'Assignment status updated successfully!'
        })
      }
    )
  }
)


// ================================
// DELETE ASSIGNMENT
// ================================

app.delete(
  '/api/assignments/:id',
  (req, res) => {

    const assignmentId =
      req.params.id

    const sql = `
      DELETE FROM assignments
      WHERE id = ?
    `

    db.query(
      sql,
      [assignmentId],
      (error) => {

        if (error) {

          console.log(
            'Assignment deletion failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Assignment could not be deleted.'
          })
        }

        res.json({
          message:
            'Assignment deleted successfully!'
        })
      }
    )
  }
)


// ================================
// SUBMIT ASSIGNMENT PDF
// ================================

app.post(
  '/api/assignments/:id/submission',
  upload.single('submission'),
  (req, res) => {

    const assignmentId =
      req.params.id

    const studentId =
      req.body.studentId

    if (!studentId) {

      if (req.file) {
        fs.unlinkSync(
          req.file.path
        )
      }

      return res.status(400).json({
        message:
          'Student ID is required.'
      })
    }

    if (!req.file) {

      return res.status(400).json({
        message:
          'Please select a PDF file.'
      })
    }

    const assignmentSql = `
      SELECT
        id,
        classroom_id
      FROM assignments
      WHERE id = ?
    `

    db.query(
      assignmentSql,
      [assignmentId],
      (error, assignmentResults) => {

        if (error) {

          fs.unlinkSync(
            req.file.path
          )

          console.log(
            'Assignment submission check failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to verify assignment.'
          })
        }

        if (
          assignmentResults.length === 0
        ) {

          fs.unlinkSync(
            req.file.path
          )

          return res.status(404).json({
            message:
              'Assignment not found.'
          })
        }

        const userSql = `
          SELECT
            id,
            role
          FROM users
          WHERE id = ?
        `

        db.query(
          userSql,
          [studentId],
          (error, userResults) => {

            if (error) {

              fs.unlinkSync(
                req.file.path
              )

              console.log(
                'Student verification failed:',
                error.message
              )

              return res.status(500).json({
                message:
                  'Unable to verify student.'
              })
            }

            if (
              userResults.length === 0
            ) {

              fs.unlinkSync(
                req.file.path
              )

              return res.status(404).json({
                message:
                  'Student account not found.'
              })
            }

            if (
              userResults[0].role !==
              'student'
            ) {

              fs.unlinkSync(
                req.file.path
              )

              return res.status(403).json({
                message:
                  'Only students can submit assignments.'
              })
            }

            const classroomId =
              assignmentResults[0].classroom_id

            if (!classroomId) {

              saveAssignmentSubmission(
                assignmentId,
                studentId,
                req.file,
                res
              )

              return
            }

            const memberSql = `
              SELECT
                id
              FROM classroom_members
              WHERE classroom_id = ?
                AND student_id = ?
              LIMIT 1
            `

            db.query(
              memberSql,
              [
                classroomId,
                studentId
              ],
              (error, memberResults) => {

                if (error) {

                  fs.unlinkSync(
                    req.file.path
                  )

                  console.log(
                    'Submission membership check failed:',
                    error.message
                  )

                  return res.status(500).json({
                    message:
                      'Unable to verify classroom membership.'
                  })
                }

                if (
                  memberResults.length === 0
                ) {

                  fs.unlinkSync(
                    req.file.path
                  )

                  return res.status(403).json({
                    message:
                      'You are not a member of this classroom.'
                  })
                }

                saveAssignmentSubmission(
                  assignmentId,
                  studentId,
                  req.file,
                  res
                )
              }
            )
          }
        )
      }
    )
  }
)


// ================================
// SAVE ASSIGNMENT SUBMISSION
// ================================

function saveAssignmentSubmission(
  assignmentId,
  studentId,
  file,
  res
) {

  const checkSql = `
    SELECT
      id,
      file_name,
      file_path
    FROM assignment_submissions
    WHERE assignment_id = ?
      AND student_id = ?
    LIMIT 1
  `

  db.query(
    checkSql,
    [
      assignmentId,
      studentId
    ],
    (error, existingResults) => {

      if (error) {

        fs.unlinkSync(
          file.path
        )

        console.log(
          'Submission check failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Unable to check existing submission.'
        })
      }

      if (
        existingResults.length > 0
      ) {

        fs.unlinkSync(
          file.path
        )

        return res.status(400).json({
          message:
            'You have already submitted this assignment.'
        })
      }

      const filePath =
        `/uploads/assignments/${file.filename}`

      const insertSql = `
        INSERT INTO assignment_submissions
        (
          assignment_id,
          student_id,
          file_name,
          file_path
        )
        VALUES (?, ?, ?, ?)
      `

      db.query(
        insertSql,
        [
          assignmentId,
          studentId,
          file.originalname,
          filePath
        ],
        (error, result) => {

          if (error) {

            fs.unlinkSync(
              file.path
            )

            console.log(
              'Assignment submission save failed:',
              error.message
            )

            return res.status(500).json({
              message:
                'Assignment submission could not be saved.'
            })
          }

          res.json({
            message:
              'Assignment submitted successfully!',

            submissionId:
              result.insertId,

            fileName:
              file.originalname,

            filePath:
              filePath
          })
        }
      )
    }
  )
}


// ================================
// GET STUDENT SUBMISSION
// ================================

app.get(
  '/api/assignments/:id/submission/:studentId',
  (req, res) => {

    const assignmentId =
      req.params.id

    const studentId =
      req.params.studentId

    const sql = `
      SELECT
        assignment_submissions.id,
        assignment_submissions.assignment_id,
        assignment_submissions.student_id,
        assignment_submissions.file_name,
        assignment_submissions.file_path,
        assignment_submissions.submitted_at
      FROM assignment_submissions
      WHERE assignment_submissions.assignment_id = ?
        AND assignment_submissions.student_id = ?
      LIMIT 1
    `

    db.query(
      sql,
      [
        assignmentId,
        studentId
      ],
      (error, results) => {

        if (error) {

          console.log(
            'Submission fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get submission.'
          })
        }

        if (
          results.length === 0
        ) {

          return res.json({
            submitted: false
          })
        }

        res.json({
          submitted: true,
          submission:
            results[0]
        })
      }
    )
  }
)


// ================================
// CREATE CLASSROOM
// ================================

app.post(
  '/api/classrooms',
  (req, res) => {

    const {
      name,
      description,
      teacherId
    } = req.body

    if (!name || !teacherId) {

      return res.status(400).json({
        message:
          'Classroom name and teacher ID are required.'
      })
    }

    const classroomCode =
      'CLS-' +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()

    const sql = `
      INSERT INTO classrooms
      (name, description, classroom_code, teacher_id)
      VALUES (?, ?, ?, ?)
    `

    db.query(
      sql,
      [
        name,
        description,
        classroomCode,
        teacherId
      ],
      (error, result) => {

        if (error) {

          console.log(
            'Classroom creation failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Classroom could not be created.'
          })
        }

        console.log(
          'Classroom created successfully!'
        )

        console.log(
          'Classroom ID:',
          result.insertId
        )

        console.log(
          'Classroom Code:',
          classroomCode
        )

        console.log(
          'Teacher ID:',
          teacherId
        )

        res.json({
          message:
            'Classroom created successfully!',

          classroomId:
            result.insertId,

          classroomCode:
            classroomCode
        })
      }
    )
  }
)


// ================================
// GET TEACHER CLASSROOMS
// ================================

app.get(
  '/api/classrooms/teacher/:teacherId',
  (req, res) => {

    const teacherId =
      req.params.teacherId

    const sql = `
      SELECT
        id,
        name,
        description,
        classroom_code,
        teacher_id
      FROM classrooms
      WHERE teacher_id = ?
      ORDER BY id DESC
    `

    db.query(
      sql,
      [teacherId],
      (error, results) => {

        if (error) {

          console.log(
            'Classrooms fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get classrooms.'
          })
        }

        res.json(results)
      }
    )
  }
)


// ================================
// DELETE CLASSROOM (TEACHER)
// ================================

app.delete('/api/classrooms/:id', (req, res) => {

  const classroomId = req.params.id
  const { teacherId } = req.body

  if (!teacherId) {
    return res.status(400).json({
      message: 'Teacher ID is required.'
    })
  }

  // Check that the user is a teacher
  const verifyTeacherSql = `
        SELECT id, role
        FROM users
        WHERE id = ?
    `

  db.query(
    verifyTeacherSql,
    [teacherId],
    (error, results) => {

      if (error) {
        console.log(
          'Teacher verification failed:',
          error.message
        )

        return res.status(500).json({
          message: 'Unable to verify teacher.'
        })
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Teacher account not found.'
        })
      }

      if (results[0].role !== 'teacher') {
        return res.status(403).json({
          message: 'Only teachers can delete classrooms.'
        })
      }

      // Check that this teacher owns the classroom
      const verifyClassroomSql = `
                SELECT id
                FROM classrooms
                WHERE id = ?
                AND teacher_id = ?
            `

      db.query(
        verifyClassroomSql,
        [classroomId, teacherId],
        (error, classroomResults) => {

          if (error) {
            console.log(
              'Classroom verification failed:',
              error.message
            )

            return res.status(500).json({
              message: 'Unable to verify classroom.'
            })
          }

          if (classroomResults.length === 0) {
            return res.status(403).json({
              message:
                'You can only delete your own classroom.'
            })
          }

          // Delete classroom members
          const deleteMembersSql = `
                        DELETE FROM classroom_members
                        WHERE classroom_id = ?
                    `

          db.query(
            deleteMembersSql,
            [classroomId],
            (error) => {

              if (error) {
                console.log(
                  'Unable to delete classroom members:',
                  error.message
                )

                return res.status(500).json({
                  message:
                    'Unable to delete classroom.'
                })
              }

              // Delete assignments
              const deleteAssignmentsSql = `
                                DELETE FROM assignments
                                WHERE classroom_id = ?
                            `

              db.query(
                deleteAssignmentsSql,
                [classroomId],
                (error) => {

                  if (error) {
                    console.log(
                      'Unable to delete classroom assignments:',
                      error.message
                    )

                    return res.status(500).json({
                      message:
                        'Unable to delete classroom.'
                    })
                  }

                  // Delete notes
                  const deleteNotesSql = `
                                        DELETE FROM notes
                                        WHERE classroom_id = ?
                                    `

                  db.query(
                    deleteNotesSql,
                    [classroomId],
                    (error) => {

                      if (error) {
                        console.log(
                          'Unable to delete classroom notes:',
                          error.message
                        )

                        return res.status(500).json({
                          message:
                            'Unable to delete classroom.'
                        })
                      }

                      // Delete conversations
                      const deleteConversationsSql = `
                                                DELETE FROM conversations
                                                WHERE classroom_id = ?
                                            `

                      db.query(
                        deleteConversationsSql,
                        [classroomId],
                        (error) => {

                          if (error) {
                            console.log(
                              'Unable to delete classroom conversations:',
                              error.message
                            )

                            return res.status(500).json({
                              message:
                                'Unable to delete classroom.'
                            })
                          }

                          // Finally delete classroom
                          const deleteClassroomSql = `
                                                        DELETE FROM classrooms
                                                        WHERE id = ?
                                                        AND teacher_id = ?
                                                    `

                          db.query(
                            deleteClassroomSql,
                            [
                              classroomId,
                              teacherId
                            ],
                            (error, result) => {

                              if (error) {
                                console.log(
                                  'Unable to delete classroom:',
                                  error.message
                                )

                                return res.status(500).json({
                                  message:
                                    'Unable to delete classroom.'
                                })
                              }

                              if (
                                result.affectedRows === 0
                              ) {
                                return res.status(404).json({
                                  message:
                                    'Classroom not found.'
                                })
                              }

                              res.json({
                                message:
                                  'Classroom deleted successfully.'
                              })
                            }
                          )
                        }
                      )
                    }
                  )
                }
              )
            }
          )
        }
      )
    }
  )
})


// ================================
// LEAVE CLASSROOM (STUDENT)
// ================================

app.delete(
  '/api/classrooms/:id/leave',
  (req, res) => {

    const classroomId =
      req.params.id

    const { studentId } =
      req.body

    if (!studentId) {

      return res.status(400).json({
        message:
          'Student ID is required.'
      })
    }

    // Check that the user is a student
    const verifyStudentSql = `
      SELECT
        id,
        role
      FROM users
      WHERE id = ?
    `

    db.query(
      verifyStudentSql,
      [studentId],
      (error, results) => {

        if (error) {

          console.log(
            'Student verification failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to verify student.'
          })
        }

        if (results.length === 0) {

          return res.status(404).json({
            message:
              'Student account not found.'
          })
        }

        if (
          results[0].role !== 'student'
        ) {

          return res.status(403).json({
            message:
              'Only students can leave classrooms.'
          })
        }

        // Remove the student from the classroom
        const leaveClassroomSql = `
          DELETE FROM classroom_members
          WHERE classroom_id = ?
            AND student_id = ?
        `

        db.query(
          leaveClassroomSql,
          [
            classroomId,
            studentId
          ],
          (error, result) => {

            if (error) {

              console.log(
                'Unable to leave classroom:',
                error.message
              )

              return res.status(500).json({
                message:
                  'Unable to leave classroom.'
              })
            }

            if (
              result.affectedRows === 0
            ) {

              return res.status(404).json({
                message:
                  'You are not a member of this classroom.'
              })
            }

            res.json({
              message:
                'You have left the classroom successfully.'
            })
          }
        )
      }
    )
  }
)


// ================================
// GET CLASSROOM ASSIGNMENTS
// ================================

app.get(
  '/api/classrooms/:id/assignments',
  (req, res) => {

    const classroomId =
      req.params.id

    const sql = `
      SELECT
        id,
        title,
        subject,
        DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
        priority,
        description,
        completed,
        classroom_id,
        created_by
      FROM assignments
      WHERE classroom_id = ?
      ORDER BY due_date ASC
    `

    db.query(
      sql,
      [classroomId],
      (error, results) => {

        if (error) {

          console.log(
            'Classroom assignments fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get classroom assignments.'
          })
        }

        res.json(results)
      }
    )
  }
)


// ================================
// GET CLASSROOM DETAILS
// ================================

app.get(
  '/api/classrooms/:id',
  (req, res) => {

    const classroomId =
      req.params.id

    const sql = `
      SELECT
        classrooms.id,
        classrooms.name,
        classrooms.description,
        classrooms.classroom_code,
        classrooms.teacher_id,
        users.name AS teacher_name,
        COUNT(classroom_members.student_id) AS student_count
      FROM classrooms
      INNER JOIN users
        ON classrooms.teacher_id = users.id
      LEFT JOIN classroom_members
        ON classrooms.id = classroom_members.classroom_id
      WHERE classrooms.id = ?
      GROUP BY
        classrooms.id,
        classrooms.name,
        classrooms.description,
        classrooms.classroom_code,
        classrooms.teacher_id,
        users.name
    `

    db.query(
      sql,
      [classroomId],
      (error, results) => {

        if (error) {

          console.log(
            'Classroom details fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get classroom details.'
          })
        }

        if (
          results.length === 0
        ) {

          return res.status(404).json({
            message:
              'Classroom not found.'
          })
        }

        res.json(
          results[0]
        )
      }
    )
  }
)


// ================================
// JOIN CLASSROOM
// ================================

app.post(
  '/api/classrooms/join',
  (req, res) => {

    const {
      classroomCode,
      studentId
    } = req.body

    if (
      !classroomCode ||
      !studentId
    ) {

      return res.status(400).json({
        message:
          'Classroom code and student ID are required.'
      })
    }

    const userSql = `
      SELECT
        id,
        name,
        role
      FROM users
      WHERE id = ?
    `

    db.query(
      userSql,
      [studentId],
      (error, userResults) => {

        if (error) {

          console.log(
            'User verification failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to verify account.'
          })
        }

        if (
          userResults.length === 0
        ) {

          return res.status(404).json({
            message:
              'User account not found.'
          })
        }

        const user =
          userResults[0]

        if (
          user.role !== 'student'
        ) {

          return res.status(403).json({
            message:
              'Only student accounts can join classrooms.'
          })
        }

        const findClassroomSql = `
          SELECT
            id,
            name
          FROM classrooms
          WHERE classroom_code = ?
        `

        db.query(
          findClassroomSql,
          [classroomCode.trim()],
          (error, results) => {

            if (error) {

              console.log(
                'Classroom search failed:',
                error.message
              )

              return res.status(500).json({
                message:
                  'Unable to find classroom.'
              })
            }

            if (
              results.length === 0
            ) {

              return res.status(404).json({
                message:
                  'Classroom not found. Check the code.'
              })
            }

            const classroom =
              results[0]

            const joinSql = `
              INSERT INTO classroom_members
              (classroom_id, student_id)
              VALUES (?, ?)
            `

            db.query(
              joinSql,
              [
                classroom.id,
                studentId
              ],
              (error) => {

                if (error) {

                  if (
                    error.code ===
                    'ER_DUP_ENTRY'
                  ) {

                    return res.status(400).json({
                      message:
                        'You have already joined this classroom.'
                    })
                  }

                  console.log(
                    'Classroom join failed:',
                    error.message
                  )

                  return res.status(500).json({
                    message:
                      'Unable to join classroom.'
                  })
                }

                res.json({
                  message:
                    `You joined ${classroom.name} successfully!`
                })
              }
            )
          }
        )
      }
    )
  }
)


// ================================
// GET STUDENT CLASSROOMS
// ================================

app.get(
  '/api/classrooms/student/:studentId',
  (req, res) => {

    const studentId =
      req.params.studentId

    const sql = `
      SELECT
        classrooms.id,
        classrooms.name,
        classrooms.description,
        classrooms.classroom_code,
        classrooms.teacher_id,
        users.name AS teacher_name
      FROM classroom_members
      INNER JOIN classrooms
        ON classroom_members.classroom_id = classrooms.id
      INNER JOIN users
        ON classrooms.teacher_id = users.id
      WHERE classroom_members.student_id = ?
      ORDER BY classrooms.id DESC
    `

    db.query(
      sql,
      [studentId],
      (error, results) => {

        if (error) {

          console.log(
            'Student classrooms fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get student classrooms.'
          })
        }

        res.json(results)
      }
    )
  }
)


// ================================
// GET OR CREATE TEACHER CHAT
// ================================

app.get(
  '/api/chats/teacher/:classroomId/:studentId',
  (req, res) => {

    const classroomId =
      req.params.classroomId

    const studentId =
      req.params.studentId

    const classroomSql = `
      SELECT
        classrooms.id,
        classrooms.teacher_id,
        users.name AS teacher_name
      FROM classrooms
      INNER JOIN users
        ON classrooms.teacher_id = users.id
      INNER JOIN classroom_members
        ON classroom_members.classroom_id = classrooms.id
      WHERE classrooms.id = ?
        AND classroom_members.student_id = ?
    `

    db.query(
      classroomSql,
      [
        classroomId,
        studentId
      ],
      (error, classroomResults) => {

        if (error) {

          console.log(
            'Teacher chat classroom check failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to open teacher chat.'
          })
        }

        if (
          classroomResults.length === 0
        ) {

          return res.status(403).json({
            message:
              'You are not a member of this classroom.'
          })
        }

        const teacherId =
          classroomResults[0].teacher_id

        const teacherName =
          classroomResults[0].teacher_name

        const findConversationSql = `
          SELECT
            id
          FROM conversations
          WHERE classroom_id = ?
            AND type = 'teacher'
            AND student_id = ?
            AND teacher_id = ?
          LIMIT 1
        `

        db.query(
          findConversationSql,
          [
            classroomId,
            studentId,
            teacherId
          ],
          (error, conversationResults) => {

            if (error) {

              console.log(
                'Teacher conversation search failed:',
                error.message
              )

              return res.status(500).json({
                message:
                  'Unable to open teacher chat.'
              })
            }

            if (
              conversationResults.length > 0
            ) {

              return res.json({
                conversationId:
                  conversationResults[0].id,

                teacherId:
                  teacherId,

                teacherName:
                  teacherName
              })
            }

            const createConversationSql = `
              INSERT INTO conversations
              (
                classroom_id,
                type,
                student_id,
                teacher_id
              )
              VALUES (?, 'teacher', ?, ?)
            `

            db.query(
              createConversationSql,
              [
                classroomId,
                studentId,
                teacherId
              ],
              (error, result) => {

                if (error) {

                  console.log(
                    'Teacher conversation creation failed:',
                    error.message
                  )

                  return res.status(500).json({
                    message:
                      'Unable to create teacher chat.'
                  })
                }

                res.json({
                  conversationId:
                    result.insertId,

                  teacherId:
                    teacherId,

                  teacherName:
                    teacherName
                })
              }
            )
          }
        )
      }
    )
  }
)


// ================================
// GET TEACHER PRIVATE CHATS
// ================================

app.get(
  '/api/chats/teacher/:teacherId',
  (req, res) => {

    const teacherId =
      req.params.teacherId

    const sql = `
      SELECT
        conversations.id,
        conversations.classroom_id,
        conversations.student_id,
        conversations.teacher_id,
        classrooms.name AS classroom_name,
        users.name AS student_name,

        (
          SELECT messages.message
          FROM messages
          WHERE messages.conversation_id = conversations.id
          ORDER BY messages.created_at DESC, messages.id DESC
          LIMIT 1
        ) AS last_message

      FROM conversations

      INNER JOIN classrooms
        ON conversations.classroom_id = classrooms.id

      INNER JOIN users
        ON conversations.student_id = users.id

      WHERE conversations.type = 'teacher'
        AND conversations.teacher_id = ?

      ORDER BY conversations.id DESC
    `

    db.query(
      sql,
      [teacherId],
      (error, results) => {

        if (error) {

          console.log(
            'Teacher chats fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to get teacher chats.'
          })
        }

        res.json(results)
      }
    )
  }
)


// ================================
// GET OR CREATE STUDENT GROUP CHAT
// ================================

app.get(
  '/api/chats/student-group/:classroomId/:studentId',
  (req, res) => {

    const classroomId =
      req.params.classroomId

    const studentId =
      req.params.studentId

    const classroomSql = `
      SELECT
        classrooms.id,
        classrooms.name
      FROM classrooms
      INNER JOIN classroom_members
        ON classroom_members.classroom_id = classrooms.id
      WHERE classrooms.id = ?
        AND classroom_members.student_id = ?
    `

    db.query(
      classroomSql,
      [
        classroomId,
        studentId
      ],
      (error, classroomResults) => {

        if (error) {

          console.log(
            'Student group classroom check failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to open student group.'
          })
        }

        if (
          classroomResults.length === 0
        ) {

          return res.status(403).json({
            message:
              'You are not a member of this classroom.'
          })
        }

        const classroomName =
          classroomResults[0].name

        const findConversationSql = `
          SELECT
            id
          FROM conversations
          WHERE classroom_id = ?
            AND type = 'student_group'
          LIMIT 1
        `

        db.query(
          findConversationSql,
          [classroomId],
          (error, conversationResults) => {

            if (error) {

              console.log(
                'Student group conversation search failed:',
                error.message
              )

              return res.status(500).json({
                message:
                  'Unable to open student group.'
              })
            }

            if (
              conversationResults.length > 0
            ) {

              return res.json({
                conversationId:
                  conversationResults[0].id,

                classroomName:
                  classroomName
              })
            }

            const createConversationSql = `
              INSERT INTO conversations
              (
                classroom_id,
                type,
                student_id,
                teacher_id
              )
              VALUES (?, 'student_group', NULL, NULL)
            `

            db.query(
              createConversationSql,
              [classroomId],
              (error, result) => {

                if (error) {

                  console.log(
                    'Student group conversation creation failed:',
                    error.message
                  )

                  return res.status(500).json({
                    message:
                      'Unable to create student group.'
                  })
                }

                res.json({
                  conversationId:
                    result.insertId,

                  classroomName:
                    classroomName
                })
              }
            )
          }
        )
      }
    )
  }
)


// ================================
// GET CHAT MESSAGES
// ================================

app.get(
  '/api/chats/:conversationId/messages',
  (req, res) => {

    const conversationId =
      req.params.conversationId

    const sql = `
      SELECT
        messages.id,
        messages.message,
        messages.sender_id,
        messages.created_at,
        users.name AS sender_name
      FROM messages
      INNER JOIN users
        ON messages.sender_id = users.id
      WHERE messages.conversation_id = ?
      ORDER BY messages.created_at ASC, messages.id ASC
    `

    db.query(
      sql,
      [conversationId],
      (error, results) => {

        if (error) {

          console.log(
            'Chat messages fetch failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to load messages.'
          })
        }

        res.json(results)
      }
    )
  }
)


// ================================
// SEND CHAT MESSAGE
// Supports teacher chat + student group
// ================================

app.post(
  '/api/chats/:conversationId/messages',
  (req, res) => {

    const conversationId =
      req.params.conversationId

    const {
      senderId,
      message
    } = req.body

    if (
      !senderId ||
      !message ||
      !message.trim()
    ) {

      return res.status(400).json({
        message:
          'Sender and message are required.'
      })
    }

    const conversationSql = `
      SELECT
        id,
        classroom_id,
        type,
        student_id,
        teacher_id
      FROM conversations
      WHERE id = ?
    `

    db.query(
      conversationSql,
      [conversationId],
      (error, conversationResults) => {

        if (error) {

          console.log(
            'Conversation check failed:',
            error.message
          )

          return res.status(500).json({
            message:
              'Unable to send message.'
          })
        }

        if (
          conversationResults.length === 0
        ) {

          return res.status(404).json({
            message:
              'Conversation not found.'
          })
        }

        const conversation =
          conversationResults[0]


        // ================================
        // TEACHER CHAT PERMISSION
        // ================================

        if (
          conversation.type === 'teacher'
        ) {

          if (
            String(senderId) !==
            String(conversation.student_id) &&
            String(senderId) !==
            String(conversation.teacher_id)
          ) {

            return res.status(403).json({
              message:
                'You are not allowed to send messages in this chat.'
            })
          }

          insertChatMessage(
            conversationId,
            senderId,
            message.trim(),
            res
          )

          return
        }


        // ================================
        // STUDENT GROUP PERMISSION
        // ================================

        if (
          conversation.type ===
          'student_group'
        ) {

          const memberSql = `
            SELECT
              id
            FROM classroom_members
            WHERE classroom_id = ?
              AND student_id = ?
            LIMIT 1
          `

          db.query(
            memberSql,
            [
              conversation.classroom_id,
              senderId
            ],
            (error, memberResults) => {

              if (error) {

                console.log(
                  'Student group membership check failed:',
                  error.message
                )

                return res.status(500).json({
                  message:
                    'Unable to send message.'
                })
              }

              if (
                memberResults.length === 0
              ) {

                return res.status(403).json({
                  message:
                    'You are not a member of this classroom.'
                })
              }

              insertChatMessage(
                conversationId,
                senderId,
                message.trim(),
                res
              )
            }
          )

          return
        }

        return res.status(400).json({
          message:
            'Invalid conversation type.'
        })
      }
    )
  }
)


// ================================
// INSERT CHAT MESSAGE
// ================================

function insertChatMessage(
  conversationId,
  senderId,
  message,
  res
) {

  const insertSql = `
    INSERT INTO messages
    (
      conversation_id,
      sender_id,
      message
    )
    VALUES (?, ?, ?)
  `

  db.query(
    insertSql,
    [
      conversationId,
      senderId,
      message
    ],
    (error, result) => {

      if (error) {

        console.log(
          'Message sending failed:',
          error.message
        )

        return res.status(500).json({
          message:
            'Message could not be sent.'
        })
      }

      res.json({
        message:
          'Message sent successfully!',

        messageId:
          result.insertId
      })
    }
  )
}


// ================================
// MULTER ERROR HANDLER
// ================================

app.use(
  (error, req, res, next) => {

    if (
      error instanceof multer.MulterError
    ) {

      if (
        error.code ===
        'LIMIT_FILE_SIZE'
      ) {

        return res.status(400).json({
          message:
            'PDF file must be 10 MB or smaller.'
        })
      }

      return res.status(400).json({
        message:
          'File upload failed.'
      })
    }

    if (
      error &&
      error.message ===
      'Only PDF files are allowed.'
    ) {

      return res.status(400).json({
        message:
          'Only PDF files are allowed.'
      })
    }

    next(error)
  }
)


// ================================
// START SERVER
// ================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    )
  }
)

