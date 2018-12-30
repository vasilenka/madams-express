const express = require('express');
const router = express.Router();
const pick = require('lodash.pick');
const empty = require('lodash.isempty');
const mongoose = require('mongoose');
const client = require('../database/connect-redis');
const { clearHash } = require('./../services/redis-cache');

let Project = require('./../models/Project');

router.get('/', async (req, res, next) => {
  Project.find()
    .select(
      '_id name status teams tags startDate endDate createdAt updatedAt from'
    )
    .populate('teams')
    .cache()
    .then(projects => {
      if (projects.length === 0) {
        return res.status(200).json({
          message: "You don't have any project yet. Create new one!"
        });
      }

      let projectData = projects.map(project => {
        return {
          ...pick(project, [
            '_id',
            'name',
            'teams',
            'status',
            'from',
            'tags',
            'startDate',
            'endDate',
            'createdAt',
            'updatedAt'
          ])
        };
      });

      res.status(200).send({
        message: 'GET request to the /projects',
        projects: projectData
      });
    })
    .catch(err => {
      console.log(err);
      res.status(400).json({
        message: 'Unable to fetch project',
        error: err
      });
    });
});

router.get('/:projectId', async (req, res, next) => {
  let query = req.params.projectId;
  Project.findById(query)
    // .select('_id name teams status tags startDate endDate createdAt updatedAt from')
    .populate('teams')
    .then(project => {
      if (!project) {
        res.status(404).json({
          message: 'Unable to get project with provided projectId'
        });
      }

      let projectData = pick(project, [
        '_id',
        'name',
        'teams',
        'tags',
        'status',
        'from',
        'startDate',
        'endDate',
        'createdAt',
        'updatedAt'
      ]);
      res.status(200).json({
        message: 'GET request to project/:projectId',
        project: projectData
      });
    })
    .catch(err => {
      console.log(err);
      res.send(500).json({
        message: 'Unable to fetch project data',
        served: 'mongo',
        error: err
      });
    });
});

router.post('/', async (req, res, next) => {
  let project = new Project({
    _id: new mongoose.Types.ObjectId(),
    ...pick(req.body, [
      'name',
      'from',
      'teams',
      'status',
      'tags',
      'startDate',
      'endDate'
    ])
  });

  try {
    let saved = await project.save();
    if (saved) {
      res.status(200).json({
        message: 'POST request to the /projects',
        project: pick(saved, [
          '_id',
          'name',
          'teams',
          'from',
          'tags',
          'startDate',
          'status',
          'endDate',
          'createdAt',
          'updatedAt'
        ])
      });
      clearHash();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Unable to create projects!',
      served: 'mongo',
      error: err
    });
  }
});

router.patch('/:projectId', (req, res, next) => {
  let query = req.params.projectId;
  let projectData = pick(req.body, [
    'name',
    'teams',
    'status',
    'tags',
    'startDate',
    'endDate'
  ]);
  if (empty(projectData)) {
    res.status(304).json({
      message: "No project's data modified",
      project: null
    });
  }
  projectData.updatedAt = Date.now();
  Project.findByIdAndUpdate(query, { $set: projectData }, { new: true })
    .populate('teams')
    .then(project => {
      res.status(200).json({
        message: 'Project data updated successfully!',
        project: project
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "Unable to update project's data",
        error: err
      });
    });
});

router.delete('/:projectId', (req, res, next) => {
  let query = req.params.projectId;
  Project.findByIdAndDelete(query)
    .select('_id name teams tags startDate endDate createdAt updatedAt')
    .populate('teams')
    .then(project => {
      res.status(200).json({
        message: 'Project deleted successfully!',
        project: {
          ...pick(project, [
            '_id',
            'name',
            'teams',
            'tags',
            'status',
            'startDate',
            'endDate',
            'createdAt',
            'updatedAt'
          ])
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Unable to delete project',
        error: err
      });
    });
});

module.exports = router;
