import io
import sys
import zipfile
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).parents[1] / 'scripts'))
from migration_media import archive_files, copy_verified

def archive(entries):
    out=io.BytesIO()
    with zipfile.ZipFile(out,'w') as z:
        for name,data in entries:z.writestr(name,data)
    return out.getvalue()

def test_archive_rejects_traversal_and_duplicate_paths():
    for entries in [[('../bad',b'x')],[('x.jpg',b'a'),('x.jpg',b'b')]]:
        with pytest.raises(ValueError):archive_files(archive(entries))

def test_archive_omits_bucket_metadata_and_bounds_bytes():
    assert archive_files(archive([('bucket_metadata.json',b'{}'),('x.jpg',b'ab')]))=={'x.jpg':b'ab'}
    with pytest.raises(ValueError):archive_files(archive([('x.jpg',b'abc')]),max_file=2)

def test_copy_is_idempotent_and_refuses_different_existing_bytes():
    stored={'same':b'a'};writes=[]
    def upload(path,data):writes.append(path);stored[path]=data
    assert copy_verified({'same':b'a','new':b'b'},stored.get,upload)==['same','new']
    assert writes==['new']
    with pytest.raises(ValueError):copy_verified({'same':b'wrong'},stored.get,upload)
    assert writes==['new']

def test_failed_upload_or_readback_stops_without_retry():
    attempts=[]
    def upload(path,data):attempts.append(path)
    with pytest.raises(ValueError):copy_verified({'first':b'a','second':b'b'},lambda p:None,upload)
    assert attempts==['first']

def test_uncertain_upload_never_retries():
    attempts=[]
    def upload(path,data):attempts.append(path);raise TimeoutError()
    with pytest.raises(TimeoutError):copy_verified({'first':b'a'},lambda p:None,upload)
    assert attempts==['first']
