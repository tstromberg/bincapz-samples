"use strict";

const Stream = require('stream');
const net = require('net');
const tls = require('tls');
// eslint-disable-next-line node/no-deprecated-api
const {
  parse
} = require('url');
const process = require('process');
const semverGte = require('semver/functions/gte');
let http2;
if (semverGte(process.version, 'v10.10.0')) http2 = require('http2');else throw new Error('superagent: this version of Node.js does not support http2');
const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_AUTHORITY,
  HTTP2_HEADER_HOST,
  HTTP2_HEADER_SET_COOKIE,
  NGHTTP2_CANCEL
} = http2.constants;
function setProtocol(protocol) {
  return {
    request(options) {
      return new Request(protocol, options);
    }
  };
}
class Request extends Stream {
  constructor(protocol, options) {
    super();
    const defaultPort = protocol === 'https:' ? 443 : 80;
    const defaultHost = 'localhost';
    const port = options.port || defaultPort;
    const host = options.host || defaultHost;
    delete options.port;
    delete options.host;
    this.method = options.method;
    this.path = options.path;
    this.protocol = protocol;
    this.host = host;
    delete options.method;
    delete options.path;
    const sessionOptions = {
      ...options
    };
    if (options.socketPath) {
      sessionOptions.socketPath = options.socketPath;
      sessionOptions.createConnection = this.createUnixConnection.bind(this);
    }
    this._headers = {};
    const session = http2.connect(`${protocol}//${host}:${port}`, sessionOptions);
    this.setHeader('host', `${host}:${port}`);
    session.on('error', error => this.emit('error', error));
    this.session = session;
  }
  createUnixConnection(authority, options) {
    switch (this.protocol) {
      case 'http:':
        return net.connect(options.socketPath);
      case 'https:':
        options.ALPNProtocols = ['h2'];
        options.servername = this.host;
        options.allowHalfOpen = true;
        return tls.connect(options.socketPath, options);
      default:
        throw new Error('Unsupported protocol', this.protocol);
    }
  }
  setNoDelay(bool) {
    // We can not use setNoDelay with HTTP/2.
    // Node 10 limits http2session.socket methods to ones safe to use with HTTP/2.
    // See also https://nodejs.org/api/http2.html#http2_http2session_socket
  }
  getFrame() {
    if (this.frame) {
      return this.frame;
    }
    const method = {
      [HTTP2_HEADER_PATH]: this.path,
      [HTTP2_HEADER_METHOD]: this.method
    };
    let headers = this.mapToHttp2Header(this._headers);
    headers = Object.assign(headers, method);
    const frame = this.session.request(headers);
    frame.once('response', (headers, flags) => {
      headers = this.mapToHttpHeader(headers);
      frame.headers = headers;
      frame.statusCode = headers[HTTP2_HEADER_STATUS];
      frame.status = frame.statusCode;
      this.emit('response', frame);
    });
    this._headerSent = true;
    frame.once('drain', () => this.emit('drain'));
    frame.on('error', error => this.emit('error', error));
    frame.on('close', () => this.session.close());
    this.frame = frame;
    return frame;
  }
  mapToHttpHeader(headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (let key of keys) {
      let value = headers[key];
      key = key.toLowerCase();
      switch (key) {
        case HTTP2_HEADER_SET_COOKIE:
          value = Array.isArray(value) ? value : [value];
          break;
        default:
          break;
      }
      http2Headers[key] = value;
    }
    return http2Headers;
  }
  mapToHttp2Header(headers) {
    const keys = Object.keys(headers);
    const http2Headers = {};
    for (let key of keys) {
      let value = headers[key];
      key = key.toLowerCase();
      switch (key) {
        case HTTP2_HEADER_HOST:
          key = HTTP2_HEADER_AUTHORITY;
          value = /^http:\/\/|^https:\/\//.test(value) ? parse(value).host : value;
          break;
        default:
          break;
      }
      http2Headers[key] = value;
    }
    return http2Headers;
  }
  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
  }
  getHeader(name) {
    return this._headers[name.toLowerCase()];
  }
  write(data, encoding) {
    const frame = this.getFrame();
    return frame.write(data, encoding);
  }
  pipe(stream, options) {
    const frame = this.getFrame();
    return frame.pipe(stream, options);
  }
  end(data) {
    const frame = this.getFrame();
    frame.end(data);
  }
  abort(data) {
    const frame = this.getFrame();
    frame.close(NGHTTP2_CANCEL);
    this.session.destroy();
  }
}
exports.setProtocol = setProtocol;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJlYW0iLCJyZXF1aXJlIiwibmV0IiwidGxzIiwicGFyc2UiLCJwcm9jZXNzIiwic2VtdmVyR3RlIiwiaHR0cDIiLCJ2ZXJzaW9uIiwiRXJyb3IiLCJIVFRQMl9IRUFERVJfUEFUSCIsIkhUVFAyX0hFQURFUl9TVEFUVVMiLCJIVFRQMl9IRUFERVJfTUVUSE9EIiwiSFRUUDJfSEVBREVSX0FVVEhPUklUWSIsIkhUVFAyX0hFQURFUl9IT1NUIiwiSFRUUDJfSEVBREVSX1NFVF9DT09LSUUiLCJOR0hUVFAyX0NBTkNFTCIsImNvbnN0YW50cyIsInNldFByb3RvY29sIiwicHJvdG9jb2wiLCJyZXF1ZXN0Iiwib3B0aW9ucyIsIlJlcXVlc3QiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHRQb3J0IiwiZGVmYXVsdEhvc3QiLCJwb3J0IiwiaG9zdCIsIm1ldGhvZCIsInBhdGgiLCJzZXNzaW9uT3B0aW9ucyIsInNvY2tldFBhdGgiLCJjcmVhdGVDb25uZWN0aW9uIiwiY3JlYXRlVW5peENvbm5lY3Rpb24iLCJiaW5kIiwiX2hlYWRlcnMiLCJzZXNzaW9uIiwiY29ubmVjdCIsInNldEhlYWRlciIsIm9uIiwiZXJyb3IiLCJlbWl0IiwiYXV0aG9yaXR5IiwiQUxQTlByb3RvY29scyIsInNlcnZlcm5hbWUiLCJhbGxvd0hhbGZPcGVuIiwic2V0Tm9EZWxheSIsImJvb2wiLCJnZXRGcmFtZSIsImZyYW1lIiwiaGVhZGVycyIsIm1hcFRvSHR0cDJIZWFkZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJvbmNlIiwiZmxhZ3MiLCJtYXBUb0h0dHBIZWFkZXIiLCJzdGF0dXNDb2RlIiwic3RhdHVzIiwiX2hlYWRlclNlbnQiLCJjbG9zZSIsImtleXMiLCJodHRwMkhlYWRlcnMiLCJrZXkiLCJ2YWx1ZSIsInRvTG93ZXJDYXNlIiwiQXJyYXkiLCJpc0FycmF5IiwidGVzdCIsIm5hbWUiLCJnZXRIZWFkZXIiLCJ3cml0ZSIsImRhdGEiLCJlbmNvZGluZyIsInBpcGUiLCJzdHJlYW0iLCJlbmQiLCJhYm9ydCIsImRlc3Ryb3kiLCJleHBvcnRzIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL25vZGUvaHR0cDJ3cmFwcGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgbmV0ID0gcmVxdWlyZSgnbmV0Jyk7XG5jb25zdCB0bHMgPSByZXF1aXJlKCd0bHMnKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBub2RlL25vLWRlcHJlY2F0ZWQtYXBpXG5jb25zdCB7IHBhcnNlIH0gPSByZXF1aXJlKCd1cmwnKTtcbmNvbnN0IHByb2Nlc3MgPSByZXF1aXJlKCdwcm9jZXNzJyk7XG5jb25zdCBzZW12ZXJHdGUgPSByZXF1aXJlKCdzZW12ZXIvZnVuY3Rpb25zL2d0ZScpO1xuXG5sZXQgaHR0cDI7XG5cbmlmIChzZW12ZXJHdGUocHJvY2Vzcy52ZXJzaW9uLCAndjEwLjEwLjAnKSkgaHR0cDIgPSByZXF1aXJlKCdodHRwMicpO1xuZWxzZVxuICB0aHJvdyBuZXcgRXJyb3IoJ3N1cGVyYWdlbnQ6IHRoaXMgdmVyc2lvbiBvZiBOb2RlLmpzIGRvZXMgbm90IHN1cHBvcnQgaHR0cDInKTtcblxuY29uc3Qge1xuICBIVFRQMl9IRUFERVJfUEFUSCxcbiAgSFRUUDJfSEVBREVSX1NUQVRVUyxcbiAgSFRUUDJfSEVBREVSX01FVEhPRCxcbiAgSFRUUDJfSEVBREVSX0FVVEhPUklUWSxcbiAgSFRUUDJfSEVBREVSX0hPU1QsXG4gIEhUVFAyX0hFQURFUl9TRVRfQ09PS0lFLFxuICBOR0hUVFAyX0NBTkNFTFxufSA9IGh0dHAyLmNvbnN0YW50cztcblxuZnVuY3Rpb24gc2V0UHJvdG9jb2wocHJvdG9jb2wpIHtcbiAgcmV0dXJuIHtcbiAgICByZXF1ZXN0KG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBuZXcgUmVxdWVzdChwcm90b2NvbCwgb3B0aW9ucyk7XG4gICAgfVxuICB9O1xufVxuXG5jbGFzcyBSZXF1ZXN0IGV4dGVuZHMgU3RyZWFtIHtcbiAgY29uc3RydWN0b3IocHJvdG9jb2wsIG9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuICAgIGNvbnN0IGRlZmF1bHRQb3J0ID0gcHJvdG9jb2wgPT09ICdodHRwczonID8gNDQzIDogODA7XG4gICAgY29uc3QgZGVmYXVsdEhvc3QgPSAnbG9jYWxob3N0JztcbiAgICBjb25zdCBwb3J0ID0gb3B0aW9ucy5wb3J0IHx8IGRlZmF1bHRQb3J0O1xuICAgIGNvbnN0IGhvc3QgPSBvcHRpb25zLmhvc3QgfHwgZGVmYXVsdEhvc3Q7XG5cbiAgICBkZWxldGUgb3B0aW9ucy5wb3J0O1xuICAgIGRlbGV0ZSBvcHRpb25zLmhvc3Q7XG5cbiAgICB0aGlzLm1ldGhvZCA9IG9wdGlvbnMubWV0aG9kO1xuICAgIHRoaXMucGF0aCA9IG9wdGlvbnMucGF0aDtcbiAgICB0aGlzLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgdGhpcy5ob3N0ID0gaG9zdDtcblxuICAgIGRlbGV0ZSBvcHRpb25zLm1ldGhvZDtcbiAgICBkZWxldGUgb3B0aW9ucy5wYXRoO1xuXG4gICAgY29uc3Qgc2Vzc2lvbk9wdGlvbnMgPSB7IC4uLm9wdGlvbnMgfTtcbiAgICBpZiAob3B0aW9ucy5zb2NrZXRQYXRoKSB7XG4gICAgICBzZXNzaW9uT3B0aW9ucy5zb2NrZXRQYXRoID0gb3B0aW9ucy5zb2NrZXRQYXRoO1xuICAgICAgc2Vzc2lvbk9wdGlvbnMuY3JlYXRlQ29ubmVjdGlvbiA9IHRoaXMuY3JlYXRlVW5peENvbm5lY3Rpb24uYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICB0aGlzLl9oZWFkZXJzID0ge307XG5cbiAgICBjb25zdCBzZXNzaW9uID0gaHR0cDIuY29ubmVjdChcbiAgICAgIGAke3Byb3RvY29sfS8vJHtob3N0fToke3BvcnR9YCxcbiAgICAgIHNlc3Npb25PcHRpb25zXG4gICAgKTtcbiAgICB0aGlzLnNldEhlYWRlcignaG9zdCcsIGAke2hvc3R9OiR7cG9ydH1gKTtcblxuICAgIHNlc3Npb24ub24oJ2Vycm9yJywgKGVycm9yKSA9PiB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IpKTtcblxuICAgIHRoaXMuc2Vzc2lvbiA9IHNlc3Npb247XG4gIH1cblxuICBjcmVhdGVVbml4Q29ubmVjdGlvbihhdXRob3JpdHksIG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHRoaXMucHJvdG9jb2wpIHtcbiAgICAgIGNhc2UgJ2h0dHA6JzpcbiAgICAgICAgcmV0dXJuIG5ldC5jb25uZWN0KG9wdGlvbnMuc29ja2V0UGF0aCk7XG4gICAgICBjYXNlICdodHRwczonOlxuICAgICAgICBvcHRpb25zLkFMUE5Qcm90b2NvbHMgPSBbJ2gyJ107XG4gICAgICAgIG9wdGlvbnMuc2VydmVybmFtZSA9IHRoaXMuaG9zdDtcbiAgICAgICAgb3B0aW9ucy5hbGxvd0hhbGZPcGVuID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRscy5jb25uZWN0KG9wdGlvbnMuc29ja2V0UGF0aCwgb3B0aW9ucyk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHByb3RvY29sJywgdGhpcy5wcm90b2NvbCk7XG4gICAgfVxuICB9XG5cbiAgc2V0Tm9EZWxheShib29sKSB7XG4gICAgLy8gV2UgY2FuIG5vdCB1c2Ugc2V0Tm9EZWxheSB3aXRoIEhUVFAvMi5cbiAgICAvLyBOb2RlIDEwIGxpbWl0cyBodHRwMnNlc3Npb24uc29ja2V0IG1ldGhvZHMgdG8gb25lcyBzYWZlIHRvIHVzZSB3aXRoIEhUVFAvMi5cbiAgICAvLyBTZWUgYWxzbyBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAyLmh0bWwjaHR0cDJfaHR0cDJzZXNzaW9uX3NvY2tldFxuICB9XG5cbiAgZ2V0RnJhbWUoKSB7XG4gICAgaWYgKHRoaXMuZnJhbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmZyYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZCA9IHtcbiAgICAgIFtIVFRQMl9IRUFERVJfUEFUSF06IHRoaXMucGF0aCxcbiAgICAgIFtIVFRQMl9IRUFERVJfTUVUSE9EXTogdGhpcy5tZXRob2RcbiAgICB9O1xuXG4gICAgbGV0IGhlYWRlcnMgPSB0aGlzLm1hcFRvSHR0cDJIZWFkZXIodGhpcy5faGVhZGVycyk7XG5cbiAgICBoZWFkZXJzID0gT2JqZWN0LmFzc2lnbihoZWFkZXJzLCBtZXRob2QpO1xuXG4gICAgY29uc3QgZnJhbWUgPSB0aGlzLnNlc3Npb24ucmVxdWVzdChoZWFkZXJzKTtcblxuICAgIGZyYW1lLm9uY2UoJ3Jlc3BvbnNlJywgKGhlYWRlcnMsIGZsYWdzKSA9PiB7XG4gICAgICBoZWFkZXJzID0gdGhpcy5tYXBUb0h0dHBIZWFkZXIoaGVhZGVycyk7XG4gICAgICBmcmFtZS5oZWFkZXJzID0gaGVhZGVycztcbiAgICAgIGZyYW1lLnN0YXR1c0NvZGUgPSBoZWFkZXJzW0hUVFAyX0hFQURFUl9TVEFUVVNdO1xuICAgICAgZnJhbWUuc3RhdHVzID0gZnJhbWUuc3RhdHVzQ29kZTtcbiAgICAgIHRoaXMuZW1pdCgncmVzcG9uc2UnLCBmcmFtZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9oZWFkZXJTZW50ID0gdHJ1ZTtcblxuICAgIGZyYW1lLm9uY2UoJ2RyYWluJywgKCkgPT4gdGhpcy5lbWl0KCdkcmFpbicpKTtcbiAgICBmcmFtZS5vbignZXJyb3InLCAoZXJyb3IpID0+IHRoaXMuZW1pdCgnZXJyb3InLCBlcnJvcikpO1xuICAgIGZyYW1lLm9uKCdjbG9zZScsICgpID0+IHRoaXMuc2Vzc2lvbi5jbG9zZSgpKTtcblxuICAgIHRoaXMuZnJhbWUgPSBmcmFtZTtcbiAgICByZXR1cm4gZnJhbWU7XG4gIH1cblxuICBtYXBUb0h0dHBIZWFkZXIoaGVhZGVycykge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhoZWFkZXJzKTtcbiAgICBjb25zdCBodHRwMkhlYWRlcnMgPSB7fTtcbiAgICBmb3IgKGxldCBrZXkgb2Yga2V5cykge1xuICAgICAgbGV0IHZhbHVlID0gaGVhZGVyc1trZXldO1xuICAgICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlIEhUVFAyX0hFQURFUl9TRVRfQ09PS0lFOlxuICAgICAgICAgIHZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGh0dHAySGVhZGVyc1trZXldID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGh0dHAySGVhZGVycztcbiAgfVxuXG4gIG1hcFRvSHR0cDJIZWFkZXIoaGVhZGVycykge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhoZWFkZXJzKTtcbiAgICBjb25zdCBodHRwMkhlYWRlcnMgPSB7fTtcbiAgICBmb3IgKGxldCBrZXkgb2Yga2V5cykge1xuICAgICAgbGV0IHZhbHVlID0gaGVhZGVyc1trZXldO1xuICAgICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlIEhUVFAyX0hFQURFUl9IT1NUOlxuICAgICAgICAgIGtleSA9IEhUVFAyX0hFQURFUl9BVVRIT1JJVFk7XG4gICAgICAgICAgdmFsdWUgPSAvXmh0dHA6XFwvXFwvfF5odHRwczpcXC9cXC8vLnRlc3QodmFsdWUpXG4gICAgICAgICAgICA/IHBhcnNlKHZhbHVlKS5ob3N0XG4gICAgICAgICAgICA6IHZhbHVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBodHRwMkhlYWRlcnNba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBodHRwMkhlYWRlcnM7XG4gIH1cblxuICBzZXRIZWFkZXIobmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLl9oZWFkZXJzW25hbWUudG9Mb3dlckNhc2UoKV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGdldEhlYWRlcihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYWRlcnNbbmFtZS50b0xvd2VyQ2FzZSgpXTtcbiAgfVxuXG4gIHdyaXRlKGRhdGEsIGVuY29kaW5nKSB7XG4gICAgY29uc3QgZnJhbWUgPSB0aGlzLmdldEZyYW1lKCk7XG4gICAgcmV0dXJuIGZyYW1lLndyaXRlKGRhdGEsIGVuY29kaW5nKTtcbiAgfVxuXG4gIHBpcGUoc3RyZWFtLCBvcHRpb25zKSB7XG4gICAgY29uc3QgZnJhbWUgPSB0aGlzLmdldEZyYW1lKCk7XG4gICAgcmV0dXJuIGZyYW1lLnBpcGUoc3RyZWFtLCBvcHRpb25zKTtcbiAgfVxuXG4gIGVuZChkYXRhKSB7XG4gICAgY29uc3QgZnJhbWUgPSB0aGlzLmdldEZyYW1lKCk7XG4gICAgZnJhbWUuZW5kKGRhdGEpO1xuICB9XG5cbiAgYWJvcnQoZGF0YSkge1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5nZXRGcmFtZSgpO1xuICAgIGZyYW1lLmNsb3NlKE5HSFRUUDJfQ0FOQ0VMKTtcbiAgICB0aGlzLnNlc3Npb24uZGVzdHJveSgpO1xuICB9XG59XG5cbmV4cG9ydHMuc2V0UHJvdG9jb2wgPSBzZXRQcm90b2NvbDtcbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDaEMsTUFBTUMsR0FBRyxHQUFHRCxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQzFCLE1BQU1FLEdBQUcsR0FBR0YsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUMxQjtBQUNBLE1BQU07RUFBRUc7QUFBTSxDQUFDLEdBQUdILE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDaEMsTUFBTUksT0FBTyxHQUFHSixPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE1BQU1LLFNBQVMsR0FBR0wsT0FBTyxDQUFDLHNCQUFzQixDQUFDO0FBRWpELElBQUlNLEtBQUs7QUFFVCxJQUFJRCxTQUFTLENBQUNELE9BQU8sQ0FBQ0csT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFRCxLQUFLLEdBQUdOLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUVuRSxNQUFNLElBQUlRLEtBQUssQ0FBQyw0REFBNEQsQ0FBQztBQUUvRSxNQUFNO0VBQ0pDLGlCQUFpQjtFQUNqQkMsbUJBQW1CO0VBQ25CQyxtQkFBbUI7RUFDbkJDLHNCQUFzQjtFQUN0QkMsaUJBQWlCO0VBQ2pCQyx1QkFBdUI7RUFDdkJDO0FBQ0YsQ0FBQyxHQUFHVCxLQUFLLENBQUNVLFNBQVM7QUFFbkIsU0FBU0MsV0FBV0EsQ0FBQ0MsUUFBUSxFQUFFO0VBQzdCLE9BQU87SUFDTEMsT0FBT0EsQ0FBQ0MsT0FBTyxFQUFFO01BQ2YsT0FBTyxJQUFJQyxPQUFPLENBQUNILFFBQVEsRUFBRUUsT0FBTyxDQUFDO0lBQ3ZDO0VBQ0YsQ0FBQztBQUNIO0FBRUEsTUFBTUMsT0FBTyxTQUFTdEIsTUFBTSxDQUFDO0VBQzNCdUIsV0FBV0EsQ0FBQ0osUUFBUSxFQUFFRSxPQUFPLEVBQUU7SUFDN0IsS0FBSyxDQUFDLENBQUM7SUFDUCxNQUFNRyxXQUFXLEdBQUdMLFFBQVEsS0FBSyxRQUFRLEdBQUcsR0FBRyxHQUFHLEVBQUU7SUFDcEQsTUFBTU0sV0FBVyxHQUFHLFdBQVc7SUFDL0IsTUFBTUMsSUFBSSxHQUFHTCxPQUFPLENBQUNLLElBQUksSUFBSUYsV0FBVztJQUN4QyxNQUFNRyxJQUFJLEdBQUdOLE9BQU8sQ0FBQ00sSUFBSSxJQUFJRixXQUFXO0lBRXhDLE9BQU9KLE9BQU8sQ0FBQ0ssSUFBSTtJQUNuQixPQUFPTCxPQUFPLENBQUNNLElBQUk7SUFFbkIsSUFBSSxDQUFDQyxNQUFNLEdBQUdQLE9BQU8sQ0FBQ08sTUFBTTtJQUM1QixJQUFJLENBQUNDLElBQUksR0FBR1IsT0FBTyxDQUFDUSxJQUFJO0lBQ3hCLElBQUksQ0FBQ1YsUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ1EsSUFBSSxHQUFHQSxJQUFJO0lBRWhCLE9BQU9OLE9BQU8sQ0FBQ08sTUFBTTtJQUNyQixPQUFPUCxPQUFPLENBQUNRLElBQUk7SUFFbkIsTUFBTUMsY0FBYyxHQUFHO01BQUUsR0FBR1Q7SUFBUSxDQUFDO0lBQ3JDLElBQUlBLE9BQU8sQ0FBQ1UsVUFBVSxFQUFFO01BQ3RCRCxjQUFjLENBQUNDLFVBQVUsR0FBR1YsT0FBTyxDQUFDVSxVQUFVO01BQzlDRCxjQUFjLENBQUNFLGdCQUFnQixHQUFHLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDeEU7SUFFQSxJQUFJLENBQUNDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFbEIsTUFBTUMsT0FBTyxHQUFHN0IsS0FBSyxDQUFDOEIsT0FBTyxDQUMxQixHQUFFbEIsUUFBUyxLQUFJUSxJQUFLLElBQUdELElBQUssRUFBQyxFQUM5QkksY0FDRixDQUFDO0lBQ0QsSUFBSSxDQUFDUSxTQUFTLENBQUMsTUFBTSxFQUFHLEdBQUVYLElBQUssSUFBR0QsSUFBSyxFQUFDLENBQUM7SUFFekNVLE9BQU8sQ0FBQ0csRUFBRSxDQUFDLE9BQU8sRUFBR0MsS0FBSyxJQUFLLElBQUksQ0FBQ0MsSUFBSSxDQUFDLE9BQU8sRUFBRUQsS0FBSyxDQUFDLENBQUM7SUFFekQsSUFBSSxDQUFDSixPQUFPLEdBQUdBLE9BQU87RUFDeEI7RUFFQUgsb0JBQW9CQSxDQUFDUyxTQUFTLEVBQUVyQixPQUFPLEVBQUU7SUFDdkMsUUFBUSxJQUFJLENBQUNGLFFBQVE7TUFDbkIsS0FBSyxPQUFPO1FBQ1YsT0FBT2pCLEdBQUcsQ0FBQ21DLE9BQU8sQ0FBQ2hCLE9BQU8sQ0FBQ1UsVUFBVSxDQUFDO01BQ3hDLEtBQUssUUFBUTtRQUNYVixPQUFPLENBQUNzQixhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDOUJ0QixPQUFPLENBQUN1QixVQUFVLEdBQUcsSUFBSSxDQUFDakIsSUFBSTtRQUM5Qk4sT0FBTyxDQUFDd0IsYUFBYSxHQUFHLElBQUk7UUFDNUIsT0FBTzFDLEdBQUcsQ0FBQ2tDLE9BQU8sQ0FBQ2hCLE9BQU8sQ0FBQ1UsVUFBVSxFQUFFVixPQUFPLENBQUM7TUFDakQ7UUFDRSxNQUFNLElBQUlaLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUNVLFFBQVEsQ0FBQztJQUMxRDtFQUNGO0VBRUEyQixVQUFVQSxDQUFDQyxJQUFJLEVBQUU7SUFDZjtJQUNBO0lBQ0E7RUFBQTtFQUdGQyxRQUFRQSxDQUFBLEVBQUc7SUFDVCxJQUFJLElBQUksQ0FBQ0MsS0FBSyxFQUFFO01BQ2QsT0FBTyxJQUFJLENBQUNBLEtBQUs7SUFDbkI7SUFFQSxNQUFNckIsTUFBTSxHQUFHO01BQ2IsQ0FBQ2xCLGlCQUFpQixHQUFHLElBQUksQ0FBQ21CLElBQUk7TUFDOUIsQ0FBQ2pCLG1CQUFtQixHQUFHLElBQUksQ0FBQ2dCO0lBQzlCLENBQUM7SUFFRCxJQUFJc0IsT0FBTyxHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUMsSUFBSSxDQUFDaEIsUUFBUSxDQUFDO0lBRWxEZSxPQUFPLEdBQUdFLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDSCxPQUFPLEVBQUV0QixNQUFNLENBQUM7SUFFeEMsTUFBTXFCLEtBQUssR0FBRyxJQUFJLENBQUNiLE9BQU8sQ0FBQ2hCLE9BQU8sQ0FBQzhCLE9BQU8sQ0FBQztJQUUzQ0QsS0FBSyxDQUFDSyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUNKLE9BQU8sRUFBRUssS0FBSyxLQUFLO01BQ3pDTCxPQUFPLEdBQUcsSUFBSSxDQUFDTSxlQUFlLENBQUNOLE9BQU8sQ0FBQztNQUN2Q0QsS0FBSyxDQUFDQyxPQUFPLEdBQUdBLE9BQU87TUFDdkJELEtBQUssQ0FBQ1EsVUFBVSxHQUFHUCxPQUFPLENBQUN2QyxtQkFBbUIsQ0FBQztNQUMvQ3NDLEtBQUssQ0FBQ1MsTUFBTSxHQUFHVCxLQUFLLENBQUNRLFVBQVU7TUFDL0IsSUFBSSxDQUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRVEsS0FBSyxDQUFDO0lBQzlCLENBQUMsQ0FBQztJQUVGLElBQUksQ0FBQ1UsV0FBVyxHQUFHLElBQUk7SUFFdkJWLEtBQUssQ0FBQ0ssSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDUSxLQUFLLENBQUNWLEVBQUUsQ0FBQyxPQUFPLEVBQUdDLEtBQUssSUFBSyxJQUFJLENBQUNDLElBQUksQ0FBQyxPQUFPLEVBQUVELEtBQUssQ0FBQyxDQUFDO0lBQ3ZEUyxLQUFLLENBQUNWLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUNILE9BQU8sQ0FBQ3dCLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFN0MsSUFBSSxDQUFDWCxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsT0FBT0EsS0FBSztFQUNkO0VBRUFPLGVBQWVBLENBQUNOLE9BQU8sRUFBRTtJQUN2QixNQUFNVyxJQUFJLEdBQUdULE1BQU0sQ0FBQ1MsSUFBSSxDQUFDWCxPQUFPLENBQUM7SUFDakMsTUFBTVksWUFBWSxHQUFHLENBQUMsQ0FBQztJQUN2QixLQUFLLElBQUlDLEdBQUcsSUFBSUYsSUFBSSxFQUFFO01BQ3BCLElBQUlHLEtBQUssR0FBR2QsT0FBTyxDQUFDYSxHQUFHLENBQUM7TUFDeEJBLEdBQUcsR0FBR0EsR0FBRyxDQUFDRSxXQUFXLENBQUMsQ0FBQztNQUN2QixRQUFRRixHQUFHO1FBQ1QsS0FBS2hELHVCQUF1QjtVQUMxQmlELEtBQUssR0FBR0UsS0FBSyxDQUFDQyxPQUFPLENBQUNILEtBQUssQ0FBQyxHQUFHQSxLQUFLLEdBQUcsQ0FBQ0EsS0FBSyxDQUFDO1VBQzlDO1FBQ0Y7VUFDRTtNQUNKO01BRUFGLFlBQVksQ0FBQ0MsR0FBRyxDQUFDLEdBQUdDLEtBQUs7SUFDM0I7SUFFQSxPQUFPRixZQUFZO0VBQ3JCO0VBRUFYLGdCQUFnQkEsQ0FBQ0QsT0FBTyxFQUFFO0lBQ3hCLE1BQU1XLElBQUksR0FBR1QsTUFBTSxDQUFDUyxJQUFJLENBQUNYLE9BQU8sQ0FBQztJQUNqQyxNQUFNWSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLEtBQUssSUFBSUMsR0FBRyxJQUFJRixJQUFJLEVBQUU7TUFDcEIsSUFBSUcsS0FBSyxHQUFHZCxPQUFPLENBQUNhLEdBQUcsQ0FBQztNQUN4QkEsR0FBRyxHQUFHQSxHQUFHLENBQUNFLFdBQVcsQ0FBQyxDQUFDO01BQ3ZCLFFBQVFGLEdBQUc7UUFDVCxLQUFLakQsaUJBQWlCO1VBQ3BCaUQsR0FBRyxHQUFHbEQsc0JBQXNCO1VBQzVCbUQsS0FBSyxHQUFHLHdCQUF3QixDQUFDSSxJQUFJLENBQUNKLEtBQUssQ0FBQyxHQUN4QzVELEtBQUssQ0FBQzRELEtBQUssQ0FBQyxDQUFDckMsSUFBSSxHQUNqQnFDLEtBQUs7VUFDVDtRQUNGO1VBQ0U7TUFDSjtNQUVBRixZQUFZLENBQUNDLEdBQUcsQ0FBQyxHQUFHQyxLQUFLO0lBQzNCO0lBRUEsT0FBT0YsWUFBWTtFQUNyQjtFQUVBeEIsU0FBU0EsQ0FBQytCLElBQUksRUFBRUwsS0FBSyxFQUFFO0lBQ3JCLElBQUksQ0FBQzdCLFFBQVEsQ0FBQ2tDLElBQUksQ0FBQ0osV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHRCxLQUFLO0VBQzNDO0VBRUFNLFNBQVNBLENBQUNELElBQUksRUFBRTtJQUNkLE9BQU8sSUFBSSxDQUFDbEMsUUFBUSxDQUFDa0MsSUFBSSxDQUFDSixXQUFXLENBQUMsQ0FBQyxDQUFDO0VBQzFDO0VBRUFNLEtBQUtBLENBQUNDLElBQUksRUFBRUMsUUFBUSxFQUFFO0lBQ3BCLE1BQU14QixLQUFLLEdBQUcsSUFBSSxDQUFDRCxRQUFRLENBQUMsQ0FBQztJQUM3QixPQUFPQyxLQUFLLENBQUNzQixLQUFLLENBQUNDLElBQUksRUFBRUMsUUFBUSxDQUFDO0VBQ3BDO0VBRUFDLElBQUlBLENBQUNDLE1BQU0sRUFBRXRELE9BQU8sRUFBRTtJQUNwQixNQUFNNEIsS0FBSyxHQUFHLElBQUksQ0FBQ0QsUUFBUSxDQUFDLENBQUM7SUFDN0IsT0FBT0MsS0FBSyxDQUFDeUIsSUFBSSxDQUFDQyxNQUFNLEVBQUV0RCxPQUFPLENBQUM7RUFDcEM7RUFFQXVELEdBQUdBLENBQUNKLElBQUksRUFBRTtJQUNSLE1BQU12QixLQUFLLEdBQUcsSUFBSSxDQUFDRCxRQUFRLENBQUMsQ0FBQztJQUM3QkMsS0FBSyxDQUFDMkIsR0FBRyxDQUFDSixJQUFJLENBQUM7RUFDakI7RUFFQUssS0FBS0EsQ0FBQ0wsSUFBSSxFQUFFO0lBQ1YsTUFBTXZCLEtBQUssR0FBRyxJQUFJLENBQUNELFFBQVEsQ0FBQyxDQUFDO0lBQzdCQyxLQUFLLENBQUNXLEtBQUssQ0FBQzVDLGNBQWMsQ0FBQztJQUMzQixJQUFJLENBQUNvQixPQUFPLENBQUMwQyxPQUFPLENBQUMsQ0FBQztFQUN4QjtBQUNGO0FBRUFDLE9BQU8sQ0FBQzdELFdBQVcsR0FBR0EsV0FBVyIsImlnbm9yZUxpc3QiOltdfQ==