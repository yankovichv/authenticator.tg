import { formatTitle, parseURI } from '@lib/totp'
import InputCode from '@components/InputCode'
import CardCode from '@components/CardCode'
import Block from '@components/Block'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import Sortable from 'sortablejs'
import css from './style.pcss'
import React from 'react'
import Ref from '@lib/ref'

/** Below this many accounts everything fits on screen and search is noise. */
const SEARCH_FROM = 6

export default class ViewCards extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      items: this.formatAccounts(props.accounts),
      query: '',
    }

    this.intervalId = null
    this.sortable = null
    this.list = React.createRef()
    this.ref = new Ref()
  }

  static propTypes = {
    accounts: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      uri: PropTypes.string.isRequired
    })),
    style: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    onEdit: PropTypes.func,
    onCopy: PropTypes.func,
    onMove: PropTypes.func,
    onGrab: PropTypes.func,
    onMounted: PropTypes.func
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted()
    }

    this.intervalId = setInterval(() => {
      for (const { uuid, totp } of this.visible) {
        const time = this.ref.element(`time:${uuid}`)
        const code = this.ref.element(`code:${uuid}`)

        // A filtered-out card is unmounted and its refs are empty.
        if (!time || !code) {
          continue
        }

        const left = this.getTime(totp)
        time.innerText = left

        if (left === totp.period) {
          code.innerText = this.getCode(totp)
        }
      }
    }, 1000)

    this.sortable = Sortable.create(this.list.current, {
      animation: 150,
      // On touch the drag has to wait, otherwise it would fight scrolling.
      // With a mouse it starts on movement, which never blocks a click.
      delay: 300,
      delayOnTouchOnly: true,
      touchStartThreshold: 5,
      // Cards have no background of their own — only the page does. The
      // browser's native drag image would therefore be a transparent card
      // smeared over the list, so the dragged copy is rendered by us and
      // given a real background.
      forceFallback: true,
      fallbackClass: css['cards_flying'],
      ghostClass: css['cards_ghost'],
      onStart: () => {
        // Toggled on the DOM node rather than through state: a re-render in
        // the middle of a drag would fight Sortable over the same nodes.
        this.list.current.classList.add(css['cards_dragging'])

        if (this.props.onGrab) {
          this.props.onGrab()
        }
      },
      onEnd: (event) => {
        this.list.current.classList.remove(css['cards_dragging'])
        this.move(event)
      },
    })
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.accounts) !== JSON.stringify(this.props.accounts)) {
      this.setState({ items: this.formatAccounts(this.props.accounts) })
    }

    // Positions in a filtered list say nothing about the real order.
    if (this.sortable) {
      this.sortable.option('disabled', this.state.query.trim().length > 0)
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)

    if (this.sortable) {
      this.sortable.destroy()
    }
  }

  render() {
    const visible = this.visible

    return (
      <Block
        box
        fillY
        fillX
        style={this.props.style}
        className={classNames(css['cards'], {
          [this.props.className]: !!this.props.className,
        })}
      >
        {this.state.items.length >= SEARCH_FROM &&
          <Block
            fillX
            box
            className={css['cards_search']}
          >
            <InputCode
              label="Search"
              value={this.state.query}
              placeholder="Account or service"
              onChange={(e) => this.setState({ query: e.target.value })}
              onClear={() => this.setState({ query: '' })}
            />
          </Block>
        }

        <div ref={this.list}>
          {visible.map(({ uuid, totp }, index) => {
            return (
              <CardCode
                key={uuid}
                bordered={index < visible.length - 1}
                title={formatTitle(totp.label, totp.issuer)}
                time={(
                  <span ref={this.ref.upsert(`time:${uuid}`)}>
                    {this.getTime(totp)}
                  </span>
                )}
                code={(
                  <span ref={this.ref.upsert(`code:${uuid}`)}>
                    {this.getCode(totp)}
                  </span>
                )}
                onCopy={() => {
                  if (this.props.onCopy) {
                    this.props.onCopy(totp.generate())
                  }
                }}
                onClick={() => {
                  if (this.props.onEdit) {
                    this.props.onEdit({ uuid, totp })
                  }
                }}
              />
            )
          })}
        </div>

        {visible.length === 0 &&
          <Block
            fillX
            box
            size={16}
            height={24}
            weight={400}
            color="foreground-050"
            className={css['cards_empty']}
          >
            Nothing matches “{this.state.query.trim()}”
          </Block>
        }
      </Block>
    )
  }

  get visible() {
    const query = this.state.query.trim().toLowerCase()
    if (!query) {
      return this.state.items
    }

    return this.state.items.filter(({ totp }) => {
      return formatTitle(totp.label, totp.issuer).toLowerCase().includes(query)
    })
  }

  /**
   * Sortable moves the DOM node itself, which React knows nothing about, so
   * the node is put back and the new order is applied through state instead.
   */
  move(event) {
    const { oldIndex, newIndex } = event

    event.item.remove()
    event.from.insertBefore(event.item, event.from.children[oldIndex] || null)

    if (oldIndex !== newIndex && this.props.onMove) {
      this.props.onMove(oldIndex, newIndex)
    }
  }

  getTime(totp) {
    return totp.period - (Math.floor(Date.now() / 1000) % totp.period)
  }

  getCode(totp) {
    const formatted = totp.generate().toString().padStart(6, '0')
    return formatted.slice(0, 3) + ' ' + formatted.slice(3)
  }

  formatAccounts(accounts) {
    return accounts.map(({ uuid, uri }) => {
      return { uuid, totp: parseURI(uri) }
    })
  }
}
