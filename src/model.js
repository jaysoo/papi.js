'use strict'

import _ from 'lodash';

export default class Model {
  constructor(data) {
    _.extend(this, data);
  }
}