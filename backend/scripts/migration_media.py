"""Bounded, create-only archive media repair for verified cross-site migrations.

No credentials or implicit target. Callers supply scoped read/upload adapters.
Reuse the catalogue copier's read-before-write, no-retry and byte-readback model.
"""
import hashlib
import io
import stat
import zipfile


def archive_files(body, max_file=8*1024*1024, max_total=128*1024*1024):
    result={};seen=set();total=0
    with zipfile.ZipFile(io.BytesIO(body)) as archive:
        for info in archive.infolist():
            name=info.filename
            if (name in seen or name.startswith('/') or '\\' in name or ':' in name
                    or any(part in ('','..','.') for part in name.split('/'))
                    or stat.S_ISLNK(info.external_attr >> 16)):
                raise ValueError('Unsafe or duplicate archive path')
            seen.add(name)
            if info.file_size>max_file:raise ValueError('Object size limit exceeded')
            total+=info.file_size
            if total>max_total:raise ValueError('Archive size limit exceeded')
            data=archive.read(info)
            if name=='bucket_metadata.json':continue
            result[name]=data
    return result


def copy_verified(files, read_stored, upload, checkpoint=lambda path,digest:None):
    verified=[]
    for path,body in files.items():
        old=read_stored(path)
        if old is not None and old!=body:
            raise ValueError('Existing destination object differs; refusing overwrite')
        if old is None:
            # On ambiguous failure stop. A subsequent explicit run must reconcile
            # by reading the destination, not replaying this mutation blindly.
            upload(path,body)
            if read_stored(path)!=body:raise ValueError('Uploaded bytes failed verification')
        checkpoint(path,hashlib.sha256(body).hexdigest())
        verified.append(path)
    return verified
