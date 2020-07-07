import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  user: 'voluntr',                  
  host: 'localhost',
  database: 'voluntr',
  password: 'xanadu2017',
  port: 5432,
})

const getAll = (_ => {
  const queryMap = new Map([
    [ 'user', 'SELECT user_id, fname, lname, skills, email FROM "user"' ],
    [ 'organization', 'SELECT org_id, org_name, about, email FROM organization' ],
    [ 'job', 
      ` SELECT 
          job.*,
          organization.org_name
        FROM job 
        LEFT OUTER JOIN organization 
        ON job.org_id = organization.org_id
      `
    ],
  ])

  const get = async (type) => {
    try {
      const res = await pool.query(queryMap.get(type))
      return res.rows
    } catch (err) {
      console.error(err.stack)
    }
  }

  return {
    users: _ => get('user'),
    organizations: _ => get('organization'),
    jobs: _ => get('job'),
  }
})()

const getById = (_ => {
  const queryMap = new Map([
    [ 'user', 'SELECT user_id, fname, lname, skills, email FROM "user" WHERE user_id = $1 ' ],
    [ 'organization', 'SELECT org_id, org_name, about, email FROM organization WHERE org_id = $1 ' ],
    [ 'job', 
      `
      SELECT 
        job.*,
        organization.org_name
      FROM job 
      LEFT OUTER JOIN organization 
      ON job.org_id = organization.org_id
      WHERE job.job_id = $1
      `, 
    ],
    [ 'application', 
    `
      SELECT
        application.app_id,
        application.submitted,
        application.app_desc,
        application.app_status,
        application.job_id,
        job.job_name,
        job.skills,
        job.job_status,
        job.expiry,
        job.lat,
        job.lon,
        organization.org_id,
        organization.org_name,
        "user".user_id,
        "user".fname,
        "user".lname,
        "user".skills,
        "user".email
      FROM application
      LEFT OUTER JOIN job
        ON application.job_id = job.job_id
      LEFT OUTER JOIN organization
        ON job.org_id = organization.org_id
      LEFT OUTER JOIN "user"
        ON application.user_id = "user".user_id
      WHERE application.app_id = $1
      
    ` 
    ]
  ])

  const get = async (type, id) => {
    try {
      const res = await pool.query({
        text: queryMap.get(type),
        values: [ id ]
      })
      return res.rows
    } catch (err) {
      console.error(err.stack)
    }
  }

  return {
    user: id => get('user', id),
    organization: id => get('organization', id),
    job: id => get('job', id),
    application: id => get('application', id),
  }
})()

const getJobsByStatus = (_ => {
  const get = async (status, userId) => {
    try {
      const res = await pool.query({
        text: 
        `
          SELECT 
            job.*,
            organization.org_name,
            EXISTS 
              (SELECT * FROM saved_job WHERE saved_job.job_id = job.job_id AND saved_job.user_id = $1 ) 
            AS saved
          FROM job 
          LEFT OUTER JOIN organization 
            ON job.org_id = organization.org_id
          WHERE job.job_status = '${ status }'
        `,
        values: [ userId ]
      })

      return res.rows
    } catch (err) {
      console.error(err.stack)
    }
  }

  return {
    running: userId => get('running', userId),
    inactive: userId => get('inactive', userId),
    deleted: userId => get('deleted', userId),
  }
})()

const insertSavedJob = async (userId, jobId) => {
  try {
    const res = await pool.query({
      text: `INSERT INTO saved_job VALUES ($1, $2)`,
      values: [ userId, jobId ]
    })
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

const deleteSavedJob = async (userId, jobId) => {
  try {
    const res = await pool.query({
      text: `DELETE FROM saved_job WHERE user_id = $1 AND job_id = $2`,
      values: [ userId, jobId ]
    })
    return res.rowCount === 1
  } catch (err) {
    console.error(err)
    return false
  }
}

const getSavedJobs = async (userId) => {
  try {
    const res = await pool.query({
      text: 
        `
          SELECT
            job.job_id,
            job.job_name,
            job.job_status,
            job.job_desc,
            job.job_status,
            job.posted,
            job.expiry,
            job.skills,
            job.lat,
            job.lon,
            organization.org_id,
            organization.org_name
          FROM saved_job
          LEFT OUTER JOIN job
          ON saved_job.job_id = job.job_id
          LEFT OUTER JOIN organization
          ON job.org_id = organization.org_id
          WHERE saved_job.user_id = $1
        `,
      values: [ userId ]
    })
    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const getIsJobSaved = async (userId, jobId) => {
  try {
    const res = await pool.query({
      text: 
        `
        SELECT EXISTS (
          SELECT 1
          FROM saved_job
          WHERE user_id = $1
          AND job_id = $2
        )
        `,
      values: [ userId, jobId ]
    })
    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const getLargestId = (_ => {
  const queryMap = new Map([
    ['user', `SELECT MAX(user_id) FROM "user"`],
    ['organization', `SELECT MAX(org_id) FROM organization`],
    ['job', `SELECT MAX(job_id) FROM job`],
    ['application', `SELECT MAX(app_id) FROM application`],
  ])

  const getMax = async (table) => {
    try {
      const res = await pool.query(queryMap.get(table))
      return res.rows[0].max
    } catch (err) {
      console.error(err.stack)
    }
  }

  return {
    users: id => getMax('user'),
    organizations: id => getMax('organization'),
    jobs: id => getMax('job'),
    applications: id => getMax('application'),
  }
})()

const insertApplication = async (userId, jobId, appDesc) => {
  try {
    const res = await pool.query(
      {
        text: 
        `
        INSERT INTO application ( app_id, user_id, job_id, submitted, app_desc, app_status )
        VALUES ( ${ await getLargestId.applications() + 1 }, $1, $2, DEFAULT, $3, DEFAULT )`,
        values: [ userId, jobId, appDesc ]
      }
    )
    return (res.rowCount === 1)
  } catch (err) {
    console.error(err)
    return false
  }
}

const getApplicationsByUser = async (userId) => {
  try {
    const res = await pool.query({
      text: 
      `
      SELECT 
        "user".user_id,
        application.app_id,
        application.submitted,
        application.app_status,
        application.job_id,
        job.job_name,
        job.skills,
        job.job_status,
        job.expiry,
        organization.org_id,
        organization.org_name
      FROM "user"
      LEFT OUTER JOIN application
        ON application.user_id = "user".user_id
      LEFT OUTER JOIN job
        ON application.job_id = job.job_id
      LEFT OUTER JOIN organization
        ON job.org_id = organization.org_id
      WHERE "user".user_id = $1    
      `
      ,
      values: [ userId ],
    })

    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const getJobsByOrg = async (orgId) => {
  try {
    const res = await pool.query({
      text: 
      `
      SELECT 
        job.job_id,
        job.job_name,
        job.skills,
        job.job_status,
        job.posted,
        job.expiry,
        job.org_id,
        organization.org_name
      FROM job 
      LEFT OUTER JOIN organization 
        ON job.org_id = organization.org_id
      WHERE job.org_id = $1
      `
      ,
      values: [ orgId ]
    })

    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Get a job by id, optionally get whether or not a job is saved
 * @param {number} jobId 
 * @param {number} [userId]
 */
const getJob = async (jobId, userId) => {
  try {
    const res = await pool.query({
      text: 
      `
      SELECT 
        job.job_id,
        job.job_name,
        job.skills,
        job.job_desc,
        job.job_status,
        job.posted,
        job.expiry,
        job.lat,
        job.lon,
        job.org_id,
        organization.org_name
        EXISTS 
          (SELECT * FROM saved_job 
            WHERE saved_job.user_id = job.job_id 
            AND saved_job.user_id = $2 ) 
        AS saved
      FROM job
      LEFT OUTER JOIN organization 
        ON job.org_id = organization.org_id
      WHERE job.job_id = $1
      `
      ,
      values: [ jobId, userId ]
    })

    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const getApplicationsByJob = async (jobId) => {
  try {
    const res = await pool.query({
      text: 
      `
      SELECT 
        application.app_id,
        application.user_id,
        "user".fname,
        "user".lname,
        job.job_id,
        job.job_name,
        job.job_status,
        job.expiry,
        organization.org_id,
        organization.org_name
      FROM application 
      LEFT OUTER JOIN "user"
        ON "user".user_id = application.user_id
      LEFT OUTER JOIN job
        ON job.job_id = application.job_id
      LEFT OUTER JOIN organization
        ON job.org_id = organization.org_id
      WHERE application.job_id = $1
      `
      ,
      values: [ jobId ]
    })

    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const updateApplicationStatus = appId => {
  const set = async (newStatus) => {
    try {
      const res = await pool.query({
        text: 
        `
          UPDATE application SET app_status = '${ newStatus }' WHERE app_id = $1
        `
        ,
        values: [ appId ]
      })
  
      return res.rowCount === 1
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return {
    approve: _ => set('approved'), 
    pending: _ => set('pending'), 
    reject: _ => set('rejected'), 
    deactivate: _ => set('inactive'), 
  }
}

const oneMonthFromNow = _ => {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date
}

const insertJob = async ( jobName, orgId, skills, jobDesc, expiry = oneMonthFromNow().toISOString(), lat = -1.292066, lon = 36.821945 ) => {
  try {
    const res = await pool.query({
      text: 
      `
        INSERT INTO job (job_id, job_name, org_id, skills, job_desc, job_status, posted, expiry, lat, lon)
          VALUES (${ await getLargestId.jobs() + 1 }, $1, $2, $3, $4, DEFAULT, DEFAULT, $5, $6, $7 )
      `
      ,
      values: [ jobName, orgId, skills, jobDesc, expiry, lat, lon ]
    })

    return res.rowCount === 1
  } catch (err) {
    console.error(err)
    return false
  }
}

// select exists(select 1 from contact where id=12)

const applicationAuthorized = (_ => {
  const queryMap = new Map([
    ['user', `SELECT (SELECT user_id FROM application WHERE app_id = $1) = $2;` ],
    ['organization', `SELECT (SELECT organization.org_id FROM application
      LEFT OUTER JOIN job ON application.job_id = job.job_id
      LEFT OUTER JOIN organization ON job.org_id = organization.org_id
      WHERE application.app_id = $1) = $2;` ],
  ])

  const appAuthorized = async (clientType, appId, clientId) => {
    try {
      const res = await pool.query({
        text: queryMap.get(clientType),
        values: [ appId, clientId ]
      })

      return Object.values(res.rows[0])[0]
    } catch (err) {
      console.error(err)
    }
  }

  return {
    user: (appId, clientId) => appAuthorized('user', appId, clientId),
    organization: (appId, clientId) => appAuthorized('organization', appId, clientId),
  }
})()

const updateJob = async (jobId, jobName, orgId, skills, jobDesc, jobStatus, expiry ) => {
  try {
    const res = await pool.query({
      text: 
      `
        UPDATE job SET 
          (job_name, org_id, skills, job_desc, job_status, expiry )
          = ($2, $3, $4, $5, $6, $7)
        WHERE job_id = $1;
      `
      ,
      values: [ jobId, jobName, orgId, skills, jobDesc, jobStatus, expiry, ]
    })

    return res.rowCount === 1
  } catch (err) {
    console.error(err)
    return false
  }
}

const deleteJob = async (jobId) => {
  try {
    const res = await pool.query({
      text: 
      `
        DELETE FROM job
        WHERE job_id = $1;
      `
      ,
      values: [ jobId, ]
    })

    return res.rowCount === 1
  } catch (err) {
    console.error(err)
    return false
  }
}

const updateJobStatus = ( jobId => {
  const set = async (newStatus) => {
    try {
      const res = await pool.query({
        text: 
        `
          UPDATE job SET job_status = $2 WHERE job_id = $1;
        `
        ,
        values: [ jobId, newStatus ]
      })
  
      console.log(res)
      return res.rowCount === 1
    } catch (err) {
      console.error(err)
      return false
    }
  }

  return {
    activate: _ => set('running'), 
    deactivate: _ => set('inactive'), 
    delete: _ => set('deleted'), 
  }
})()

/**
 * Get application details by jobId and userId
 * @param {number} userId 
 * @param {number} jobId 
 */
const getApplicationsByUserJob = async (userId, jobId) => {
  try {
    const res = await pool.query({
      text: 
        `
          SELECT  
            application.submitted,
            application.app_desc,
            application.app_status,
            "user".user_id,
            "user".fname,
            "user".lname,
            "user".email,
            organization.org_id,
            organization.org_name,
            job.job_id,
            job.job_name,
            job.skills,
            job.job_desc,
            job.job_status,
            job.expiry
          FROM application
          LEFT OUTER JOIN "user"
          ON application.user_id = "user".user_id
          LEFT OUTER JOIN job
          ON application.job_id = job.job_id
          LEFT OUTER JOIN organization
          ON job.org_id = organization.org_id
          WHERE
            application.user_id = $1
          AND
            application.job_id = $2
        `,
      values: [ userId, jobId ],
    })
    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Get application details by appId
 * @param {number} appId 
 */
const getApplication = async (appId) => {
  try {
    const res = await pool.query({
      text: 
        `
          SELECT  
            application.app_id,
            application.submitted,
            application.app_desc,
            application.app_status,
            "user".user_id,
            "user".fname,
            "user".lname,
            "user".email,
            organization.org_id,
            organization.org_name,
            job.job_id,
            job.job_name,
            job.skills,
            job.job_desc,
            job.job_status,
            job.expiry
          FROM application
          LEFT OUTER JOIN "user"
          ON application.user_id = "user".user_id
          LEFT OUTER JOIN job
          ON application.job_id = job.job_id
          LEFT OUTER JOIN organization
          ON job.org_id = organization.org_id
          WHERE
            application.app_id = $1
        `,
      values: [ appId ],
    })
    return res.rows
  } catch (err) {
    console.error(err)
    return false
  }
}

const insertUser = async ( fname, lname, skills, email, passw ) => {
  try {
    const res = await pool.query({
      text: 
      `
        INSERT INTO "user" (user_id, fname, lname, skills, email, passw)
          VALUES (${ await getLargestId.users() + 1 }, $1, $2, $3, $4, $5 )
      `
      ,
      values: [ fname, lname, skills, email, passw ]
    })

    return res.rowCount === 1
  } catch (err) {
    console.error(err)
    return false
  }
}

const getUserByEmail = async (email) => {
  try {
    const res = await pool.query({
      text: 
      `
        SELECT * FROM "user"
          WHERE "user".email = $1
      `
      ,
      values: [ email ]
    })

    return res.rows[0]
  } catch (err) {
    console.error(err)
    return false
  }
}

/*   coding, design, health, finance, law, engineering, training */
const _ = (async () => {
  try {
    console.log()
    // console.log(await insertJob(...Object.values({
    //   jobName: 'Eng II',
    //   orgId: 1,
    //   skills: 'coding',
    //   jobDesc: 'Engineering Again',
    //   expiry: '2020-05-12T13:58:37.734Z',
    //   lat: -1.292066,
    //   lon: 36.821945 })))
    // console.log(await applicationAuthorized.organization(1, 2))
  } catch (error) {
    console.error(error)
  }
})()


export { 
  getAll, 
  getById,

  insertUser,
  getUserByEmail,

  insertJob, 
  getJob,
  getJobsByStatus, 
  getJobsByOrg,
  updateJob,
  updateJobStatus,
  deleteJob,

  insertSavedJob,
  deleteSavedJob, 
  getSavedJobs,
  getIsJobSaved,
  
  insertApplication, 
  getApplicationsByUserJob,
  getApplication,
  getApplicationsByUser, 
  getApplicationsByJob,
  updateApplicationStatus, 
  applicationAuthorized 
}