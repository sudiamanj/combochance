/* global sessionStorage */
/* eslint-env amd */

define(function (require) {
  var common = require('common')
  var math = require('math')
  var _ = require('lodash')
  var $ = require('jquery')
  require('bootstrap')
  require('detectmobilebrowser')

  var nRows = 1

  /** Maximum deck size to process. */
  var MAX_DECK_SIZE = 1000

  /**
   * Get all form data as an object.
   *
   * @returns {{}} Object which contains the form data.
   */
  function getData () {
    var data = {}
    data.deckSize = parseInt($('#deckSize').val())
    data.handSize = parseInt($('#handSize').val())
    data.cards = []

    for (var i = 0; i < nRows; i++) {
      var name = $('#name' + i).val()
      var numInDeck = $('#aid' + i).val()
      var numRequired = $('#ar' + i).val()

      data.cards.push({
        name: name,
        numInDeck: parseInt(numInDeck),
        numRequired: parseInt(numRequired)
      })
    }

    return data
  }

  /**
   * Handle an exception.
   *
   * @param e Exception to handle
   */
  function handle (e) {
    $('#results').html('<div class="alert alert-danger">' + e + '</div>')
  }

  /**
   * Add a row.
   */
  function addRow () {
    var row = nRows

    $('#card' + row).html('<td><input type="text" id="name' + row + '" placeholder="Card Name" class="form-control"/></td>' +
      '<td><input type="number" id="aid' + row + '" class="form-control num"/></td>' +
      '<td><input type="number" id="ar' + row + '" class="form-control num"/></td>')

    // Session storage logic
    $('#name' + row).val(sessionStorage.getItem('name' + row) || '').change(function () {
      sessionStorage.setItem('name' + row, $(this).val())
    })
    $('#aid' + row).val(sessionStorage.getItem('id' + row) || 1).change(function () {
      sessionStorage.setItem('id' + row, $(this).val())
    })
    $('#ar' + row).val(sessionStorage.getItem('req' + row) || 1).change(function () {
      sessionStorage.setItem('req' + row, $(this).val())
    })

    $('#tab_logic').append('<tr id="card' + (row + 1) + '"></tr>')
    nRows++
  }

  /**
   * Delete a row.
   */
  function deleteRow () {
    if (nRows > 1) {
      $('#card' + (nRows - 1)).html('')
      nRows--
    }
  }

  /**
   * Set form data.
   *
   * @param data Form data to set
   */
  function setData (data) {
    var numCards = data.cards.length || 1

    // Add / remove rows
    while (nRows < numCards) {
      addRow()
    }
    while (nRows > numCards) {
      deleteRow()
    }

    // Modify rows
    for (var i = 0; i < numCards; i++) {
      $('#name' + i).val(data.cards[i].name)
      $('#aid' + i).val(data.cards[i].numInDeck)
      $('#ar' + i).val(data.cards[i].numRequired)

      // Session storage logic
      sessionStorage.setItem('name' + i, data.cards[i].name)
      sessionStorage.setItem('id' + i, data.cards[i].numInDeck)
      sessionStorage.setItem('req' + i, data.cards[i].numRequired)
    }

    // Modify form data
    $('#deckSize').val(data.deckSize)
    $('#handSize').val(data.handSize)

    sessionStorage.setItem('rows', numCards)
    $('#primaryForm').submit()
  }

  $(document).ready(function () {
    // Collapse
    $('.collapse').collapse()

    // Tooltips
    $('[data-toggle="tooltip"]').tooltip()

    // Table
    for (var i = 1; i < sessionStorage.getItem('rows') || 0; i++) {
      addRow()
    }
    $('#add_row').click(function () {
      addRow()
      sessionStorage.setItem('rows', nRows)
    })
    $('#delete_row').click(function () {
      deleteRow()
      sessionStorage.setItem('rows', nRows)
    })

    // Form
    $('#primaryForm').submit(function (event) {
      event.preventDefault()

      var data = getData()

      // Validation
      if (data.handSize > data.deckSize) {
        handle('Your hand size is bigger than your deck size.')
      } else if (data.deckSize < common.getSumInDeck(data)) {
        handle('Your deck size is too small, check your "Amount in Deck" values.')
      } else if (data.handSize < common.getSumRequired(data)) {
        handle('Your hand size is too small for this combo.')
      } else if (_.some(document.getElementsByClassName('num'), function (elem) {
        return elem.value === ''
      })) {
        handle('Check your "Amount in Deck" and "Amount Required" values. One of them is not a number.')
      } else if (data.deckSize > MAX_DECK_SIZE) {
        handle('If your deck has ' + data.deckSize + ' cards, I wouldn\'t suggest playing combo.')
      } else {
        (function (chance) {
          try {
            var obj = chance
            var jq = $('#results')

            jq.empty()
              .append('Combo: ')
              .append(_.map(data.cards, function (card) {
                return card.numRequired + 'x ' + (card.name.length > 0 ? card.name : 'Unnamed Card')
              }).join(', '))
              .append('<br>Deck Size: ' + data.deckSize)
              .append(', Cards in Hand: ' + data.handSize)
              .append('<br><br>The chance of you pulling this off is' + (obj.experimental ? ' <a href="#" data-toggle="modal" data-target="#approximately">approximately</a> ' : ' '))
              .append(Number(obj.percent).toPrecision(3) + '%.')
          } catch (e) {
            handle(e)
          } finally {
            if (!$.browser.mobile) {
              window.scrollTo(0, document.body.scrollHeight)
            }
          }
        })(math.getChance(data))
      }
    })
    $('#clear').click(function () {
      $('input').each(function (index, elem) {
        if (/^(aid|ar).*$/.test(elem.id)) {
          elem.value = 1
        } else {
          elem.value = ''
        }
        while (nRows > 1) {
          deleteRow()
        }
        sessionStorage.clear()
      })
      document.getElementById('results').innerHTML = ''
    })

    // Examples
    $('#exodia').click(function (event) {
      event.preventDefault()
      setData({
        'deckSize': 40,
        'handSize': 5,
        'cards': [{
          'name': 'Exodia the Forbidden One',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Right Leg of the Forbidden One',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Left Leg of the Forbidden One',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Right Arm of the Forbidden One',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Left Arm of the Forbidden One',
          'numInDeck': 1,
          'numRequired': 1
        }]
      })
    })
    $('#channelFireball').click(function (event) {
      event.preventDefault()
      setData({
        'deckSize': 60,
        'handSize': 7,
        'cards': [{
          'name': 'Black Lotus',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Channel',
          'numInDeck': 1,
          'numRequired': 1
        }, {
          'name': 'Fireball',
          'numInDeck': 4,
          'numRequired': 1
        }, {
          'name': 'Mountain',
          'numInDeck': 24,
          'numRequired': 1
        }]
      })
    })
    $('#leyline').click(function (event) {
      event.preventDefault()
      setData({
        'deckSize': 60,
        'handSize': 7,
        'cards': [{
          'name': 'Leyline of Sanctity',
          'numInDeck': 4,
          'numRequired': 1
        }]
      })
    })
    $('#birdsOfParadise').click(function (event) {
      event.preventDefault()
      setData({
        'deckSize': 60,
        'handSize': 7,
        'cards': [{
          'name': 'Birds of Paradise',
          'numInDeck': 4,
          'numRequired': 1
        }, {
          'name': 'Forest',
          'numInDeck': 24,
          'numRequired': 1
        }]
      })
    })
  })
})
