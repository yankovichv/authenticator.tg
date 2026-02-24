import { URI as migrationURI } from 'otpauth-migration'
import { URI, TOTP } from 'otpauth'
import objectPath from 'object-path'
import { trim } from '@lib/str'

export const ensureURIs = (uri) => {
  if (!uri) {
    return []
  }

  if (uri.startsWith('otpauth-migration')) {
    const uris = migrationURI.toOTPAuthURIs(uri)
    return uris.filter((str) => {
      const data = URI.parse(str)
      return data instanceof TOTP
    })
  }

  if (uri.startsWith('otpauth')) {
    const data = URI.parse(uri)
    if (data instanceof TOTP) {
      return [uri]
    }
  }

  return []
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

