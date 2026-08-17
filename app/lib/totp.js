import { URI as migrationURI } from 'otpauth-migration'
import { URI, TOTP } from 'otpauth'
import objectPath from 'object-path'
import { trim } from '@lib/str'

/**
 * Pointing a camera at the wrong thing is a normal outcome, not a failure:
 * anything that does not parse into a TOTP account is reported as "nothing
 * recognized" rather than thrown. A parse error escaping this function would
 * leave the user with no feedback at all after scanning.
 *
 * @param {string} uri
 * @returns {string[]}
 */
export const ensureURIs = (uri) => {
  if (!uri) {
    return []
  }

  if (uri.startsWith('otpauth-migration')) {
    try {
      return migrationURI.toOTPAuthURIs(uri).filter(isTOTP)
    } catch (e) {
      return []
    }
  }

  if (uri.startsWith('otpauth') && isTOTP(uri)) {
    return [uri]
  }

  return []
}

const isTOTP = (uri) => {
  try {
    return URI.parse(uri) instanceof TOTP
  } catch (e) {
    return false
  }
}

export const parseURI = (uri) => {
  return URI.parse(uri)
}

export const formatLabel = (label, issuer) => {
  try {
    const reg = new RegExp(`(${issuer}:? ?)?(?<label>.*$)`, 'i')
    const parse = reg.exec(label)
    label = objectPath.get(parse, ['groups', 'label'], label)
  } catch (e) {
    label = label || ''
  }

  label = trim(label)
  return trim(label, ':')
}

export const formatTitle = (label, issuer) => {
  label = formatLabel(label, issuer)

  if (!issuer && !label) {
    return ''
  }

  if (!label || label === issuer) {
    return issuer
  }

  return issuer ? `${issuer}: ${label}` : label
}

